import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
})

export const aiService = {
    sortCoins,
    sortNews,
    getDailyInsight
}

async function sortCoins(userId, coins) {
    try {
        const response = await axiosInstance.post(`/api/ai/${userId}/sort-coins`, { coins })
        return { coins: response.data.coins, summary: response.data.summary }
    } catch (err) {
        console.error('Failed to sort coins:', err)
        return { coins, summary: null } // Return original on error
    }
}

async function sortNews(userId, news) {
    try {
        const response = await axiosInstance.post(`/api/ai/${userId}/sort-news`, { news })
        return { news: response.data.news, summary: response.data.summary }
    } catch (err) {
        console.error('Failed to sort news:', err)
        return { news, summary: null } // Return original on error
    }
}

async function getDailyInsight(userId, options = {}) {
    try {
        const config = options.force ? { params: { force: true } } : undefined
        const response = await axiosInstance.get(`/api/ai/${userId}/daily-insight`, config)
        return response.data
    } catch (err) {
        console.error('Failed to get daily insight:', err)
        return null
    }
}
