import axios from 'axios'

const memeAxios = axios.create({
    baseURL: 'https://meme-api.com',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const memeService = {
    getCryptoMeme
}

async function getCryptoMeme() {
    const response = await memeAxios.get('/gimme/cryptomemes')
    const data = response.data || {}

    const previewUrl = Array.isArray(data.preview) && data.preview.length
        ? data.preview[data.preview.length - 1]
        : ''
    const imageUrl = data.url || data.image || previewUrl

    if (!imageUrl) {
        throw new Error('No meme image available')
    }

    return {
        title: data.title || 'Crypto meme',
        imageUrl
    }
}
