import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
})

const storedToken = sessionStorage.getItem('authToken')
if (storedToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}

export const aiService = {
    getDailyInsight,
    getRelevantCoins
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

async function getRelevantCoins(userId) {
    try {
        const response = await axiosInstance.get(`/api/ai/${userId}/relevant-coins`)
        return response.data
    } catch (err) {
        console.error('Failed to get relevant coins:', err)
        return null
    }
}
