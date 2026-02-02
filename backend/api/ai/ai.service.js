import fs from 'fs'
import { ObjectId } from 'mongodb'
import path from 'path'
import { fileURLToPath } from 'url'
import { coinGeckoService } from '../../services/coinGecko.service.js'
import { cryptoPanicService } from '../../services/cryptoPanic.service.js'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'
const OPENROUTER_INSIGHT_MODEL = process.env.OPENROUTER_INSIGHT_MODEL || 'deepseek/deepseek-r1-0528:free'
const OPENROUTER_FALLBACK_MODELS = parseModelList(
    process.env.OPENROUTER_FALLBACK_MODELS,
    ['mistralai/mistral-small-3.1:free']
)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_APP_URL = process.env.OPENROUTER_APP_URL || ''
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'AI Crypto Advisor'
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS) || 180
const OPENROUTER_JSON_MAX_TOKENS = Number(process.env.OPENROUTER_JSON_MAX_TOKENS) || 220
const INSIGHT_TEMPERATURE = 0.3
const JSON_TEMPERATURE = 0.1
const DAILY_CONTENT_COLLECTION = 'daily_content'
const CRYPTOPANIC_FILTERS = ['rising', 'hot', 'bullish', 'bearish', 'important', 'saved', 'lol']
const CRYPTOPANIC_KINDS = ['news', 'media', 'all']
const RELEVANT_COINS_CACHE_TTL_MS = 1000 * 60 * 60 * 2 // 2 hours
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ''
const CRYPTOPANIC_AUTH_TOKEN = process.env.CRYPTOPANIC_AUTH_TOKEN || ''

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STATIC_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicNews.json')

const RELEVANT_COINS_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['coins'],
    properties: {
        coins: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 10,
            uniqueItems: true
        }
    }
}

const RELEVANT_NEWS_FILTER_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['filter', 'currencies', 'kind'],
    properties: {
        filter: { type: 'string', enum: CRYPTOPANIC_FILTERS },
        currencies: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 10,
            uniqueItems: true
        },
        kind: { type: 'string', enum: CRYPTOPANIC_KINDS }
    }
}

const RELEVANT_COINS_CACHE_BY_USER = new Map()

export const aiService = {
    getDailyInsight,
    getRelevantNewsFilter,
    getRelevantCoins
}

function isRelevantCoinsCacheValid(cache) {
    return cache && cache.data !== null && (Date.now() - cache.cachedAt < RELEVANT_COINS_CACHE_TTL_MS)
}

async function getDailyInsight(userId, options = {}) {
    const user = await userService.getById(userId)
    const collection = await dbService.getCollection(DAILY_CONTENT_COLLECTION)
    const dateKey = getDateKey()
    const userObjectId = new ObjectId(userId)
    const forceRefresh = options.force === true

    const existing = await collection.findOne({ userId: userObjectId, date: dateKey, type: 'insight' })
    if (existing?.insight && !forceRefresh) {
        return { insight: existing.insight }
    }

    const { insight, modelUsed } = await generateDailyInsight(user)

    if (insight) {
        const now = new Date()
        await collection.updateOne(
            { userId: userObjectId, date: dateKey, type: 'insight' },
            {
                $set: {
                    userId: userObjectId,
                    date: dateKey,
                    type: 'insight',
                    insight,
                    model: modelUsed || OPENROUTER_MODEL,
                    updatedAt: now
                },
                $setOnInsert: { createdAt: now }
            },
            { upsert: true }
        )
    }

    return { insight: insight || null }
}

function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10)
}

async function getRelevantCoins(userId) {
    const cached = RELEVANT_COINS_CACHE_BY_USER.get(userId)
    if (isRelevantCoinsCacheValid(cached)) return cached.data

    const user = await userService.getById(userId)
    const contextStr = buildCompactUserContext(user)

    const systemPrompt = `You are a crypto coins filter assistant. Given a user profile, return a JSON object with:
- "coins": array of 0-10 coin symbols (e.g. BTC, ETH, SOL) derived from fav-coins and voted content; map CoinGecko id to symbol (bitcoin->BTC, ethereum->ETH, solana->SOL, ripple->XRP, etc.).`
    const userMessage = `User profile:\n${contextStr}\n\nReturn JSON only.`

    let result = []
    if (OPENROUTER_API_KEY) {
        try {
            const parsed = await openRouterJsonChat(
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                {
                    schema: RELEVANT_COINS_SCHEMA,
                    schemaName: 'relevant_coins',
                    maxTokens: OPENROUTER_JSON_MAX_TOKENS,
                    temperature: JSON_TEMPERATURE,
                    model: OPENROUTER_MODEL,
                    fallbackModels: OPENROUTER_FALLBACK_MODELS
                }
            )
            loggerService.info('AI coins suggested response', parsed)
            const coins = normalizeSymbolList(parsed?.coins, 10)
            if (coins.length) result = coins
        } catch (error) {
            loggerService.error('AI coins suggested failed, using defaults', error)
        }
    }

    RELEVANT_COINS_CACHE_BY_USER.set(userId, { data: result, cachedAt: Date.now() })
    return result
}

async function getRelevantNewsFilter(userId) {
    const user = await userService.getById(userId)
    const contextStr = buildCompactUserContext(user)

    const systemPrompt = `You are a crypto news filter assistant. Given a user profile, return a JSON object with:
- "filter": one of [${CRYPTOPANIC_FILTERS.join(', ')}]
- "currencies": array of 0-10 currency symbols (e.g. BTC, ETH, SOL) derived from fav-coins and voted content; map CoinGecko id to symbol (bitcoin->BTC, ethereum->ETH, solana->SOL, ripple->XRP, etc.)
- "kind": one of [${CRYPTOPANIC_KINDS.join(', ')}]

Pick filter and kind to best match investor-type and content-type.`

    const userMessage = `User profile:\n${contextStr}\n\nReturn JSON only.`

    let params = { filter: 'rising', currencies: [], kind: 'all' }

    if (OPENROUTER_API_KEY) {
        try {
            const parsed = await openRouterJsonChat(
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                {
                    schema: RELEVANT_NEWS_FILTER_SCHEMA,
                    schemaName: 'relevant_news_filter',
                    maxTokens: OPENROUTER_JSON_MAX_TOKENS,
                    temperature: JSON_TEMPERATURE,
                    model: OPENROUTER_MODEL,
                    fallbackModels: OPENROUTER_FALLBACK_MODELS
                }
            )
            if (parsed.filter && CRYPTOPANIC_FILTERS.includes(parsed.filter)) params.filter = parsed.filter
            const currencies = normalizeSymbolList(parsed.currencies, 10)
            if (currencies.length) params.currencies = currencies
            if (parsed.kind && CRYPTOPANIC_KINDS.includes(parsed.kind)) params.kind = parsed.kind
        } catch (error) {
            loggerService.error('AI news filter failed, using defaults', error)
        }
    }
    loggerService.info('AI news filter parameters', params)

    return params
}

async function generateDailyInsight(user) {
    const fallback = buildFallbackInsight(user)

    if (!OPENROUTER_API_KEY) {
        loggerService.info('OPENROUTER_API_KEY not set, using fallback insight')
        return { insight: fallback, modelUsed: null }
    }

    try {
        const briefing = await buildDailyBriefing(user)
        const messages = [
            {
                role: 'system',
                content: 'You are a crypto assistant. Write a single daily insight, max 40 words. Use exactly 2 sentences: sentence 1 states what matters today, sentence 2 gives a risk/watch-out. Use the briefing only. No emojis.'
            },
            { role: 'user', content: `Daily briefing:\n${JSON.stringify(briefing)}\n\nWrite the insight.` }
        ]

        const model = resolveInsightModel()
        const fallbackModels = resolveInsightFallbackModels(model)
        const response = await openRouterChat(messages, {
            maxTokens: OPENROUTER_MAX_TOKENS,
            temperature: INSIGHT_TEMPERATURE,
            model,
            fallbackModels
        })
        const insight = normalizeInsight(response)
        return { insight: insight || fallback, modelUsed: model }
    } catch (error) {
        loggerService.error(`Error generating daily insight: ${error}`)
        return { insight: fallback, modelUsed: null }
    }
}

async function openRouterChat(messages, options = {}) {
    if (!OPENROUTER_API_KEY) return null

    const {
        maxTokens = OPENROUTER_MAX_TOKENS,
        temperature = INSIGHT_TEMPERATURE,
        model = OPENROUTER_MODEL,
        fallbackModels = OPENROUTER_FALLBACK_MODELS,
        responseFormat
    } = options

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`
    }

    if (OPENROUTER_APP_URL) headers['HTTP-Referer'] = OPENROUTER_APP_URL
    if (OPENROUTER_APP_TITLE) headers['X-Title'] = OPENROUTER_APP_TITLE

    const body = {
        messages,
        temperature,
        max_tokens: maxTokens
    }

    const models = Array.isArray(fallbackModels) && fallbackModels.length
        ? buildModelList(model, fallbackModels).slice(0, 3)
        : []
    if (models.length > 1) {
        body.models = models
    } else if (model) {
        body.model = model
    }

    if (responseFormat) body.response_format = responseFormat

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error?.message || error?.message || 'OpenRouter API error')
    }

    const data = await response.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
}

function buildCompactUserContext(user) {
    if (!user) return 'no profile'

    const preferences = buildUserPreferences(user)
    const investorType = preferences.investorType.length ? preferences.investorType.join(', ') : 'none'
    const favCoins = preferences.favCoins.length ? preferences.favCoins.join(', ') : 'none'
    const contentTypes = preferences.contentTypes.length ? preferences.contentTypes.join(', ') : 'none'

    const votes = Array.isArray(user.votes) ? user.votes : []
    const liked = votes
        .filter(v => v.vote === 'up')
        .map(extractVoteLabel)
        .filter(Boolean)
        .slice(0, 10)
    const disliked = votes
        .filter(v => v.vote === 'down')
        .map(extractVoteLabel)
        .filter(Boolean)
        .slice(0, 10)

    const likedStr = liked.length ? liked.join(', ') : 'none'
    const dislikedStr = disliked.length ? disliked.join(', ') : 'none'

    return `Investor: ${investorType}; Favs: ${favCoins}; Content: ${contentTypes}; Likes: ${likedStr}; Dislikes: ${dislikedStr}`
}

function buildUserPreferences(user) {
    return {
        investorType: Array.isArray(user?.preferences?.['investor-type'])
            ? user.preferences['investor-type']
            : [],
        favCoins: Array.isArray(user?.preferences?.['fav-coins'])
            ? user.preferences['fav-coins']
            : [],
        contentTypes: Array.isArray(user?.preferences?.['content-type'])
            ? user.preferences['content-type']
            : []
    }
}

function extractVoteLabel(vote) {
    if (!vote) return null
    if (vote.type === 'coin') return vote.content?.name || vote.content?.id || vote.content
    if (vote.type === 'news') return vote.content?.title || vote.content?.id || vote.content
    if (vote.type === 'insight') return vote.content?.id || vote.content?.text
    if (vote.type === 'meme') return vote.content?.title || vote.content?.id || vote.content?.imageUrl
    return vote.content?.name || vote.content?.title || vote.content?.id || vote.content
}

function buildFallbackInsight(user) {
    const favCoins = user?.preferences?.['fav-coins']?.join(', ')
    if (favCoins) {
        return `Watching ${favCoins} today; keep an eye on volatility and volume.`
    }

    const contentTypes = user?.preferences?.['content-type']?.join(', ')
    if (contentTypes) {
        return `Your ${contentTypes} focus is set; watch today's headlines for momentum shifts.`
    }

    const investorType = user?.preferences?.['investor-type']?.join(', ')
    if (investorType) {
        return `As a ${investorType} investor, stay alert for major market catalysts today.`
    }

    return 'Add a few favorite coins to unlock a sharper daily insight.'
}

function normalizeInsight(text) {
    if (!text) return null
    const cleaned = text.replace(/^[`"'\s]+|[`"'\s]+$/g, '').replace(/\s+/g, ' ')
    return limitWords(cleaned, 40)
}

function limitWords(text, maxWords) {
    if (!text) return null
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length <= maxWords) return text.trim()
    return words.slice(0, maxWords).join(' ')
}

async function openRouterJsonChat(messages, options = {}) {
    const {
        schema,
        schemaName,
        maxTokens = OPENROUTER_JSON_MAX_TOKENS,
        temperature = JSON_TEMPERATURE,
        model = OPENROUTER_MODEL,
        fallbackModels = OPENROUTER_FALLBACK_MODELS
    } = options

    if (!schema || !schemaName) {
        throw new Error('JSON schema and schemaName are required')
    }

    const responseText = await openRouterChat(messages, {
        maxTokens,
        temperature,
        model,
        fallbackModels,
        responseFormat: {
            type: 'json_schema',
            json_schema: {
                name: schemaName,
                schema,
                strict: true
            }
        }
    })

    const parsed = safeJsonParse(responseText)
    if (!parsed) {
        throw new Error('Failed to parse JSON response')
    }
    return parsed
}

async function buildDailyBriefing(user) {
    const preferences = buildUserPreferences(user)

    const [marketData, headlines] = await Promise.all([
        fetchMarketSnapshot(),
        fetchNewsHeadlines()
    ])

    const marketSummary = summarizeMarketData(marketData)

    return {
        date: getDateKey(),
        topMovers: marketSummary.topMovers,
        btc24hPct: marketSummary.btc24hPct,
        eth24hPct: marketSummary.eth24hPct,
        headlines,
        userPreferences: preferences
    }
}

async function fetchMarketSnapshot() {
    try {
        return await coinGeckoService.getCoinsMarketData({
            api_key: COINGECKO_API_KEY || undefined,
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: false
        })
    } catch (error) {
        loggerService.error('Failed to fetch market data for daily briefing', error)
        return null
    }
}

async function fetchNewsHeadlines() {
    try {
        if (CRYPTOPANIC_AUTH_TOKEN) {
            const data = await cryptoPanicService.getNews({
                auth_token: CRYPTOPANIC_AUTH_TOKEN,
                filter: 'rising',
                kind: 'news'
            })
            const headlines = extractHeadlines(data)
            if (headlines.length) return headlines
        }
    } catch (error) {
        loggerService.error('Failed to fetch CryptoPanic headlines', error)
    }

    try {
        const fileContent = fs.readFileSync(STATIC_NEWS_PATH, 'utf8')
        const parsed = JSON.parse(fileContent)
        return extractHeadlines(parsed)
    } catch (error) {
        loggerService.error('Failed to read static CryptoPanic headlines', error)
        return []
    }
}

function extractHeadlines(newsData) {
    const results = Array.isArray(newsData?.results) ? newsData.results : []
    return results
        .map(item => item?.title)
        .filter(Boolean)
        .slice(0, 5)
}

function summarizeMarketData(marketData) {
    const items = Array.isArray(marketData) ? marketData : []
    const movers = items
        .map(item => ({
            symbol: item?.symbol ? item.symbol.toUpperCase() : null,
            change24hPct: roundNumber(item?.price_change_percentage_24h, 2)
        }))
        .filter(item => item.symbol && Number.isFinite(item.change24hPct))

    const topMovers = [...movers]
        .sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct))
        .slice(0, 5)

    const btc = items.find(item => item?.id === 'bitcoin' || item?.symbol === 'btc')
    const eth = items.find(item => item?.id === 'ethereum' || item?.symbol === 'eth')

    return {
        topMovers,
        btc24hPct: roundNumber(btc?.price_change_percentage_24h, 2),
        eth24hPct: roundNumber(eth?.price_change_percentage_24h, 2)
    }
}

function roundNumber(value, decimals = 2) {
    if (!Number.isFinite(value)) return null
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

function normalizeSymbolList(list, maxItems = 10) {
    if (!Array.isArray(list)) return []
    const normalized = list
        .map(item => (typeof item === 'string' ? item.trim().toUpperCase() : null))
        .filter(Boolean)
    return [...new Set(normalized)].slice(0, maxItems)
}

function safeJsonParse(text) {
    if (!text) return null
    if (typeof text === 'object') return text
    if (typeof text !== 'string') return null
    const cleaned = text.replace(/^[`"'\s]+|[`"'\s]+$/g, '').trim()
    try {
        return JSON.parse(cleaned)
    } catch (error) {
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1))
            } catch (innerError) {
                return null
            }
        }
        return null
    }
}

function buildModelList(primaryModel, fallbackModels) {
    const models = []
    if (primaryModel) models.push(primaryModel)
    if (Array.isArray(fallbackModels)) {
        fallbackModels.forEach(model => {
            if (model && model !== primaryModel && !models.includes(model)) {
                models.push(model)
            }
        })
    }
    return models
}

function parseModelList(value, defaultList = []) {
    if (!value) return defaultList
    return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
}

function resolveInsightModel() {
    return OPENROUTER_INSIGHT_MODEL || OPENROUTER_MODEL
}

function resolveInsightFallbackModels(insightModel) {
    const fallbacks = buildModelList(OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODELS)
    if (!insightModel || insightModel === OPENROUTER_MODEL) return OPENROUTER_FALLBACK_MODELS
    return buildModelList(insightModel, fallbacks).slice(1)
}
