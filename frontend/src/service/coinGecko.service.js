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
    getCoinsMarketData
}

async function getCoinsMarketData(options = {}) {
    const { ids, vs_currency, vs_currencies, sparkline } = options
    const currency = vs_currency || vs_currencies || 'usd'

    const params = new URLSearchParams()
    params.append('vs_currency', currency)

    if (ids) {
        params.append('ids', Array.isArray(ids) ? ids.join(',') : ids)
    }
    if (sparkline !== undefined) {
        params.append('sparkline', String(sparkline))
    }

    return axiosInstance.get(`/api/market/market-data?${params.toString()}`)
        .then(response => response.data)
        .catch(error => {
            throw new Error('Failed to get coins market data: ' + error.message)
        })
}
