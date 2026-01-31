import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const memeService = {
    getCryptoMeme
}

async function getCryptoMeme() {
    const response = await axiosInstance.get('/api/market/meme')
    return response.data
}
