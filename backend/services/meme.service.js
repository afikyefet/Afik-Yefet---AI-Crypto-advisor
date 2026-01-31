const MEME_API_BASE_URL = 'https://meme-api.com'

export const memeService = {
    getCryptoMeme
}

async function getCryptoMeme() {
    const url = `${MEME_API_BASE_URL}/gimme/cryptomemes`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Meme API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
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
