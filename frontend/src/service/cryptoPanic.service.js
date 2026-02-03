import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

const storedToken = sessionStorage.getItem('authToken')
if (storedToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}

export const cryptoPanicService = {
    getRelevantNews,
    getStaticNews
}

async function getStaticNews() {
    const response = await axiosInstance.get('/api/market/news/static')
    return response.data
}

async function getRelevantNews(options = {}) {
    const { currencies, filter, region, page, kind } = options
    const params = new URLSearchParams()

    if (currencies) {
        params.append('currencies', Array.isArray(currencies) ? currencies.join(',') : currencies)
    }
    if (filter) params.append('filter', filter)
    if (region) params.append('region', region)
    if (page !== undefined) params.append('page', String(page))
    if (kind) params.append('kind', kind)

    const response = await axiosInstance.get(`/api/market/news/relevant?${params.toString()}`)
    return response.data
}
