import { coinGeckoService } from '../../services/coinGecko.service.js'
import { cryptoPanicService } from '../../services/cryptoPanic.service.js'

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ''
const CRYPTOPANIC_AUTH_TOKEN = process.env.CRYPTOPANIC_AUTH_TOKEN || ''

export const marketService = {
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
    const { currencies } = query
    if (!CRYPTOPANIC_AUTH_TOKEN) throw 'Missing CryptoPanic API token'

    return cryptoPanicService.getTrendingNews(
        CRYPTOPANIC_AUTH_TOKEN,
        splitList(currencies)
    )
}

async function getHotNews(query = {}) {
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
