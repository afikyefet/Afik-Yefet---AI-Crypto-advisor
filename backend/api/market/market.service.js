import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { coinGeckoService } from '../../services/coinGecko.service.js'
import { cryptoPanicService } from '../../services/cryptoPanic.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ''
const CRYPTOPANIC_AUTH_TOKEN = process.env.CRYPTOPANIC_AUTH_TOKEN || ''

// TEMPORARY: Use static JSON file instead of API
const USE_STATIC_NEWS = true
const STATIC_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicNews.json')
const STATIC_TRENDING_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicTrendingNews.json')
const STATIC_HOT_NEWS_PATH = path.join(__dirname, '../../public/CryptoPanicHotNews.json')

export const marketService = {
    getCoinsMarketData,
    getCoinPrices,
    getCoinsList,
    getSupportedCurrencies,
    pingCoinGecko,
    getNews,
    getTrendingNews,
    getHotNews
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

async function getNews(query = {}) {
    // TEMPORARY: Use static JSON file instead of API
    if (USE_STATIC_NEWS) {
        try {
            const fileContent = fs.readFileSync(STATIC_NEWS_PATH, 'utf8')
            return JSON.parse(fileContent)
        } catch (err) {
            throw 'Failed to read static news file'
        }
    }

    const { currencies, filter, region, page } = query
    if (!CRYPTOPANIC_AUTH_TOKEN) throw 'Missing CryptoPanic API token'

    return cryptoPanicService.getNews({
        auth_token: CRYPTOPANIC_AUTH_TOKEN,
        currencies: splitList(currencies),
        filter,
        region,
        page: page ? +page : undefined
    })
}

async function getTrendingNews(query = {}) {
    // TEMPORARY: Use static JSON file instead of API
    if (USE_STATIC_NEWS) {
        try {
            const fileContent = fs.readFileSync(STATIC_TRENDING_NEWS_PATH, 'utf8')
            return JSON.parse(fileContent)
        } catch (err) {
            throw 'Failed to read static news file'
        }
    }

    const { currencies } = query
    if (!CRYPTOPANIC_AUTH_TOKEN) throw 'Missing CryptoPanic API token'

    return cryptoPanicService.getTrendingNews(
        CRYPTOPANIC_AUTH_TOKEN,
        splitList(currencies)
    )
}

async function getHotNews(query = {}) {
    // TEMPORARY: Use static JSON file instead of API
    if (USE_STATIC_NEWS) {
        try {
            const fileContent = fs.readFileSync(STATIC_HOT_NEWS_PATH, 'utf8')
            return JSON.parse(fileContent)
        } catch (err) {
            throw 'Failed to read static news file'
        }
    }

    const { currencies } = query
    if (!CRYPTOPANIC_AUTH_TOKEN) throw 'Missing CryptoPanic API token'

    return cryptoPanicService.getHotNews(
        CRYPTOPANIC_AUTH_TOKEN,
        splitList(currencies)
    )
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
