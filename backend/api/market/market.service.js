import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { coinGeckoService } from '../../services/coinGecko.service.js'
import { cryptoPanicService } from '../../services/cryptoPanic.service.js'
import { memeService } from '../../services/meme.service.js'
import { aiService } from '../ai/ai.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ''
const CRYPTOPANIC_AUTH_TOKEN = process.env.CRYPTOPANIC_AUTH_TOKEN || ''

// TEMPORARY: Use static JSON file instead of API
const USE_STATIC_NEWS = false
const STATIC_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicNews.json')
const NEWS_CACHE_TTL_MS = 1000 * 60 * 60 * 3 // 3 hours
const NEWS_CACHE_BY_USER = new Map()

export const marketService = {
    getCoinsMarketData,
    getRelevantNews,
    getMeme
}

function isUserNewsCacheValid(cache) {
    return cache && cache.data !== null && (Date.now() - cache.cachedAt < NEWS_CACHE_TTL_MS)
}

async function getCoinsMarketData(query = {}) {
    const {
        ids,
        vs_currency,
        vs_currencies,
        order,
        per_page,
        page,
        sparkline
    } = query

    const vsCurrency =
        vs_currency ||
        (Array.isArray(vs_currencies) ? vs_currencies[0] : vs_currencies) ||
        'usd'

    return coinGeckoService.getCoinsMarketData({
        api_key: COINGECKO_API_KEY || undefined,
        ids: splitList(ids),
        vs_currency: vsCurrency,
        order,
        per_page: per_page ? +per_page : undefined,
        page: page ? +page : undefined,
        sparkline: toBoolean(sparkline)
    })
}

async function getRelevantNews(userId) {
    const cached = NEWS_CACHE_BY_USER.get(userId)
    if (isUserNewsCacheValid(cached)) return cached.data

    const { filter, currencies, kind } = await aiService.getRelevantNewsFilter(userId)
    const data = await getNews({ currencies, filter, kind })
    NEWS_CACHE_BY_USER.set(userId, { data, cachedAt: Date.now() })
    return data
}

async function getNews(query = {}) {
    if (!USE_STATIC_NEWS && CRYPTOPANIC_AUTH_TOKEN) {
        try {
            const { currencies, filter, region, page, kind } = query
            const data = await cryptoPanicService.getNews({
                auth_token: CRYPTOPANIC_AUTH_TOKEN,
                currencies: splitList(currencies),
                filter,
                region,
                page: page ? +page : undefined,
                kind
            })
            return data
        } catch (err) {
            // API failed — fall back to static file below
        }
    }

    // Fallback: use static JSON (when USE_STATIC_NEWS is true or API failed)
    try {
        const fileContent = fs.readFileSync(STATIC_NEWS_PATH, 'utf8')
        return JSON.parse(fileContent)
    } catch (err) {
        throw 'Failed to read static news file'
    }
}

async function getMeme() {
    return memeService.getCryptoMeme()
}

function splitList(value) {
    if (!value) return null
    if (Array.isArray(value)) return value
    return value.split(',').map(item => item.trim()).filter(Boolean)
}

function toBoolean(value) {
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return undefined
}
