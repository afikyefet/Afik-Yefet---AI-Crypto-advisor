import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'liquid/lfm-2.5-1.2b-instruct:free'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_APP_URL = process.env.OPENROUTER_APP_URL || ''
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'AI Crypto Advisor'
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS) || 180
const DAILY_CONTENT_COLLECTION = 'daily_content'
const CRYPTOPANIC_FILTERS = ['rising', 'hot', 'bullish', 'bearish', 'important', 'saved', 'lol']
const CRYPTOPANIC_KINDS = ['news', 'media', 'all']
const RELEVANT_COINS_CACHE_TTL_MS = 1000 * 60 * 60 * 2 // 2 hours
const RELEVANT_COINS_CACHE = { data: null, cachedAt: 0 }

export const aiService = {
    getDailyInsight,
    getRelevantNewsFilter,
    getRelevantCoins
}

function isNewsCacheValid(cache) {
    return cache.data !== null && (Date.now() - cache.cachedAt < NEWS_CACHE_TTL_MS)
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

    const insight = await generateDailyInsight(user)

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
                    model: OPENROUTER_MODEL,
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
    if (isNewsCacheValid(RELEVANT_COINS_CACHE)) return RELEVANT_COINS_CACHE.data

    const user = await userService.getById(userId)
    const context = buildCompactUserContext(user)
    const contextStr = JSON.stringify(context)

    const systemPrompt = `You are a crypto coins filter assistant. Given a user profile, reply with ONLY a JSON object (no markdown, no explanation) with exactly these keys:
    - "coins": array of 0-10 coin symbols (e.g. BTC, ETH, SOL) derived from fav-coins and voted content; map CoinGecko id to symbol (bitcoin->BTC, ethereum->ETH, solana->SOL, ripple->XRP, etc.)
    `
    const userMessage = `User profile:\n${contextStr}\n\nReturn the JSON object only.`
    console.log(contextStr);

    if (OPENROUTER_API_KEY) {
        try {
            const responseText = await openRouterChat(
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                220
            )
            const cleaned = responseText.replace(/^[`"'\s]+|[`"'\s]+$/g, '').replace(/\s+/g, ' ')
            const parsed = JSON.parse(cleaned)
            loggerService.info('AI coins suggested response', parsed)
            console.log('AI coins suggested response', parsed);
            if (parsed.coins) return parsed.coins
        } catch (error) {
            loggerService.error('AI coins suggested failed, using defaults', error)
        }
    }
    return []
}

async function getRelevantNewsFilter(userId) {
    const user = await userService.getById(userId)
    const context = buildCompactUserContext(user)
    const contextStr = JSON.stringify(context)

    const systemPrompt = `You are a crypto news filter assistant. Given a user profile, reply with ONLY a JSON object (no markdown, no explanation) with exactly these keys:
- "filter": one of [${CRYPTOPANIC_FILTERS.join(', ')}]
- "currencies": array of 0-10 currency symbols (e.g. BTC, ETH, SOL) derived from fav-coins and voted content; map CoinGecko id to symbol (bitcoin->BTC, ethereum->ETH, solana->SOL, ripple->XRP, etc.)
- "kind": one of [${CRYPTOPANIC_KINDS.join(', ')}]

Pick filter and kind to best match investor-type and content-type. Reply with nothing but the JSON.`

    const userMessage = `User profile:\n${contextStr}\n\nReturn the JSON object only.`

    let params = { filter: 'rising', currencies: [], kind: 'all' }

    if (OPENROUTER_API_KEY) {
        try {
            const responseText = await openRouterChat(
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                220
            )
            const cleaned = responseText.replace(/^[`"'\s]+|[`"'\s]+$/g, '').replace(/\s+/g, ' ')
            const parsed = JSON.parse(cleaned)
            if (parsed.filter && CRYPTOPANIC_FILTERS.includes(parsed.filter)) params.filter = parsed.filter
            if (Array.isArray(parsed.currencies)) params.currencies = parsed.currencies.slice(0, 10)
            if (parsed.kind && CRYPTOPANIC_KINDS.includes(parsed.kind)) params.kind = parsed.kind
        } catch (error) {
            loggerService.error('AI news filter failed, using defaults', error)
        }
    }
    loggerService.info('AI news filter parameters', params)
    console.log('AI news filter parameters', params);

    return params
}

async function generateDailyInsight(user) {
    const fallback = buildFallbackInsight(user)

    if (!OPENROUTER_API_KEY) {
        loggerService.info('OPENROUTER_API_KEY not set, using fallback insight')
        return fallback
    }

    try {
        const context = buildCompactUserContext(user)
        const messages = [
            { role: 'system', content: 'You are a concise crypto assistant. Reply with an elborate daily insight according to the markets status and the news that we have. keep it 40 words max. No emojis.' },
            { role: 'user', content: `User profile: ${context}. Share today's insight.` }
        ]

        const responseText = await openRouterChat(messages, OPENROUTER_MAX_TOKENS)
        const insight = normalizeInsight(responseText)
        return insight || fallback
    } catch (error) {
        loggerService.error(`Error generating daily insight: ${error}`)
        return fallback
    }
}

async function openRouterChat(messages, maxTokens = OPENROUTER_MAX_TOKENS) {
    if (!OPENROUTER_API_KEY) return null

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`
    }

    if (OPENROUTER_APP_URL) headers['HTTP-Referer'] = OPENROUTER_APP_URL
    if (OPENROUTER_APP_TITLE) headers['X-Title'] = OPENROUTER_APP_TITLE

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages,
            temperature: 0.3
        })
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

    const investorType = user.preferences?.['investor-type']?.join(', ')
    const favCoins = user.preferences?.['fav-coins']?.join(', ')
    const contentTypes = user.preferences?.['content-type']?.join(', ')

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

function extractVoteLabel(vote) {
    if (!vote) return null
    if (vote.type === 'coin') return vote.content?.name || vote.content?.id || vote.content
    if (vote.type === 'news') return vote.content?.title || vote.content?.id || vote.content
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
