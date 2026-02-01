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
const STATIC_TRENDING_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicTrendingNews.json')
const STATIC_HOT_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicHotNews.json')
const NEWS_CACHE_TTL_MS = 1000 * 60 * 60 * 3 // 3 hours
const newsCache = { data: null, cachedAt: 0 }
const trendingNewsCache = { data: null, cachedAt: 0 }
const hotNewsCache = { data: null, cachedAt: 0 }

export const marketService = {
    getCoinsMarketData,
    getCoinPrices,
    getCoinsList,
    getRelevantNews,
    getSupportedCurrencies,
    pingCoinGecko,
    getNews,
    getTrendingNews,
    getHotNews,
    getMeme
}

function isNewsCacheValid(cache) {
    return cache.data !== null && (Date.now() - cache.cachedAt < NEWS_CACHE_TTL_MS)
}

async function getCoinPrices(query = {}) {
    const {
        ids,
        vs_currencies = 'usd',
        include_market_cap,
        include_24hr_vol,
        include_24hr_change,
        include_last_updated_at,
        precision
    } = query

    if (!ids) throw 'Coin ids are required'

    return coinGeckoService.getCoinPrices({
        api_key: COINGECKO_API_KEY || undefined,
        ids,
        vs_currencies,
        include_market_cap: toBoolean(include_market_cap),
        include_24hr_vol: toBoolean(include_24hr_vol),
        include_24hr_change: toBoolean(include_24hr_change),
        include_last_updated_at: toBoolean(include_last_updated_at),
        precision
    })
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

async function getCoinsList() {
    return coinGeckoService.getCoinsList(COINGECKO_API_KEY || null)
}

async function getSupportedCurrencies() {
    return coinGeckoService.getSupportedCurrencies(COINGECKO_API_KEY || null)
}

async function pingCoinGecko() {
    return coinGeckoService.ping(COINGECKO_API_KEY || null)
}

async function getRelevantNews(userId) {
    const { filter, currencies, kind } = await aiService.getRelevantNewsFilter(userId)
    return getNews({ currencies, filter, kind })
}


async function getNews(query = {}) {
    if (isNewsCacheValid(newsCache)) return newsCache.data
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
            newsCache.data = data
            newsCache.cachedAt = Date.now()
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

async function getTrendingNews(query = {}) {
    if (isNewsCacheValid(trendingNewsCache)) return trendingNewsCache.data

    // Try API first (when we have a token and are not forcing static)
    if (!USE_STATIC_NEWS && CRYPTOPANIC_AUTH_TOKEN) {
        try {
            const { currencies } = query
            const data = await cryptoPanicService.getTrendingNews(
                CRYPTOPANIC_AUTH_TOKEN,
                splitList(currencies)
            )
            trendingNewsCache.data = data
            trendingNewsCache.cachedAt = Date.now()
            return data
        } catch (err) {
            // API failed — fall back to static file below
        }
    }

    // Fallback: use static JSON (when USE_STATIC_NEWS is true or API failed)
    try {
        const fileContent = fs.readFileSync(STATIC_TRENDING_NEWS_PATH, 'utf8')
        return JSON.parse(fileContent)
    } catch (err) {
        throw 'Failed to read static news file'
    }
}

async function getHotNews(query = {}) {
    if (isNewsCacheValid(hotNewsCache)) return hotNewsCache.data
    // Try API first (when we have a token and are not forcing static)
    if (!USE_STATIC_NEWS && CRYPTOPANIC_AUTH_TOKEN) {
        try {
            const { currencies } = query
            const data = await cryptoPanicService.getHotNews(
                CRYPTOPANIC_AUTH_TOKEN,
                splitList(currencies)
            )
            hotNewsCache.data = data
            hotNewsCache.cachedAt = Date.now()
            return data
        } catch (err) {
            // API failed — fall back to static file below
        }
    }

    // Fallback: use static JSON (when USE_STATIC_NEWS is true or API failed)
    try {
        const fileContent = fs.readFileSync(STATIC_HOT_NEWS_PATH, 'utf8')
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
