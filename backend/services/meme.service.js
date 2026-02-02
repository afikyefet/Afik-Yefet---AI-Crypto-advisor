const MEME_API_BASE_URL = 'https://meme-api.com'

export const memeService = {
    getCryptoMeme
}

async function getCryptoMeme() {

    for (let attempt = 1; attempt <= 5; attempt++) {
        try {

            const url = `${MEME_API_BASE_URL}/gimme/cryptomemes`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Meme API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const imageUrl = data.url
            if (imageUrl) {
                return {
                    title: data.title || 'Crypto meme',
                    imageUrl
                }
            }
        } catch (error) {
            if (attempt === 5) {
                throw new Error(`Failed to fetch meme after 5 attempts: ${error.message}`)
            }
        }
    }
    throw new Error('Failed to fetch meme after 5 attempts')
}
