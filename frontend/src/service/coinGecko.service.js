import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const coinGeckoService = {
    getCoinsMarketData,
    getPrices,
    getCoinsList,
    getSupportedCurrencies,
    ping
}

async function getCoinsMarketData(options = {}) {
    const { ids, vs_currency, vs_currencies } = options
    const currency = vs_currency || vs_currencies || 'usd'

    const params = new URLSearchParams()
    params.append('vs_currency', currency)

    if (ids) {
        params.append('ids', Array.isArray(ids) ? ids.join(',') : ids)
    }

    return axiosInstance.get(`/api/market/market-data?${params.toString()}`)
        .then(response => response.data)
        .catch(error => {
            throw new Error('Failed to get coins market data: ' + error.message)
        })
}

async function getPrices(options = {}) {
    const {
        ids,
        vs_currencies = 'usd',
        include_market_cap,
        include_24hr_vol,
        include_24hr_change,
        include_last_updated_at,
        precision
    } = options

    if (!ids) throw new Error('Coin ids are required')

    const params = new URLSearchParams()
    params.append('ids', Array.isArray(ids) ? ids.join(',') : ids)
    params.append(
        'vs_currencies',
        Array.isArray(vs_currencies) ? vs_currencies.join(',') : vs_currencies
    )

    if (include_market_cap !== undefined) params.append('include_market_cap', String(include_market_cap))
    if (include_24hr_vol !== undefined) params.append('include_24hr_vol', String(include_24hr_vol))
    if (include_24hr_change !== undefined) params.append('include_24hr_change', String(include_24hr_change))
    if (include_last_updated_at !== undefined) params.append('include_last_updated_at', String(include_last_updated_at))
    if (precision) params.append('precision', precision)

    const response = await axiosInstance.get(`/api/market/prices?${params.toString()}`)
    return response.data
}

async function getCoinsList() {
    const response = await axiosInstance.get('/api/market/coins')
    return response.data
}

async function getSupportedCurrencies() {
    const response = await axiosInstance.get('/api/market/currencies')
    return response.data
}

async function ping() {
    const response = await axiosInstance.get('/api/market/ping')
    return response.data
}
