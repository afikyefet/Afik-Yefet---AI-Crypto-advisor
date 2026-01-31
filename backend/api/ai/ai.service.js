import { loggerService } from '../../services/logger.service.js'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativeai.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

export const aiService = {
    sortCoins,
    sortNews
}

// Sort coins based on user preferences and votes
async function sortCoins(coins, user) {
    if (!coins || coins.length === 0) {
        return sortCoinsByRelevance(coins, user)
    }

    // If no API key, use fallback sorting
    if (!GEMINI_API_KEY) {
        loggerService.info('GEMINI_API_KEY not set, using fallback sorting')
        return sortCoinsByRelevance(coins, user)
    }

    try {
        const context = buildUserContext(user)

        // Create scoring prompt for Gemini
        const prompt = `You are a crypto advisor. Score each coin (0-100) based on relevance to this user profile:

${context}

Coins to score (return ONLY valid JSON array with id and score):
${coins.slice(0, 50).map(c => `- ${c.id} (${c.name}): $${c.current_price}, ${c.price_change_percentage_24h}%`).join('\n')}

Return ONLY a valid JSON array in this exact format: [{"id": "bitcoin", "score": 95}, {"id": "ethereum", "score": 80}]`

        const scores = await getGeminiScores(prompt)

        // Create score map
        const scoreMap = new Map(scores.map(s => [s.id, s.score]))

        // Sort coins by score (highest first), then by market cap
        const sortedCoins = [...coins].sort((a, b) => {
            const scoreA = scoreMap.get(a.id) || 0
            const scoreB = scoreMap.get(b.id) || 0
            if (scoreB !== scoreA) return scoreB - scoreA
            return (b.market_cap || 0) - (a.market_cap || 0)
        })

        // Generate summary
        const summary = await generateSummary('coins', sortedCoins.slice(0, 5), user, context)

        return { coins: sortedCoins, summary }
    } catch (error) {
        loggerService.error(`Error in aiService.sortCoins: ${error}`)
        const sortedCoins = sortCoinsByRelevance(coins, user)
        return { coins: sortedCoins, summary: null }
    }
}

// Sort news based on user preferences and votes
async function sortNews(newsItems, user) {
    if (!newsItems || newsItems.length === 0) {
        return sortNewsByRelevance(newsItems, user)
    }

    // If no API key, use fallback sorting
    if (!GEMINI_API_KEY) {
        loggerService.info('GEMINI_API_KEY not set, using fallback sorting')
        return sortNewsByRelevance(newsItems, user)
    }

    try {
        const context = buildUserContext(user)

        const prompt = `Score each news item (0-100) based on relevance to this user profile:

${context}

News to score (return ONLY valid JSON array with title and score):
${newsItems.slice(0, 30).map((n, i) => `${i + 1}. "${n.title}" (${n.kind || 'news'})`).join('\n')}

Return ONLY a valid JSON array in this exact format: [{"title": "News Title", "score": 85}, {"title": "Another News", "score": 70}]`

        const scores = await getGeminiScores(prompt)

        const scoreMap = new Map(scores.map(s => [s.title, s.score]))

        const sortedNews = [...newsItems].sort((a, b) => {
            const scoreA = scoreMap.get(a.title) || 0
            const scoreB = scoreMap.get(b.title) || 0
            return scoreB - scoreA
        })

        // Generate summary
        const summary = await generateSummary('news', sortedNews.slice(0, 5), user, context)

        return { news: sortedNews, summary }
    } catch (error) {
        loggerService.error(`Error in aiService.sortNews: ${error}`)
        const sortedNews = sortNewsByRelevance(newsItems, user)
        return { news: sortedNews, summary: null }
    }
}

// Helper: Get AI scores from Gemini API
async function getGeminiScores(prompt) {
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2000,
                responseMimeType: 'application/json'
            }
        })
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || 'Gemini API error')
    }

    const data = await response.json()

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
        throw new Error('No response from Gemini')
    }

    // Parse JSON response
    try {
        // Gemini might return JSON wrapped in markdown code blocks
        const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/```json\s*([\s\S]*?)\s*```/) || [text]
        const jsonText = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonText)
    } catch (parseError) {
        loggerService.error(`Failed to parse Gemini response: ${text}`)
        throw new Error('Invalid JSON response from Gemini')
    }
}

// Generate a one-sentence summary of the sorting
async function generateSummary(type, topItems, user, context) {
    if (!GEMINI_API_KEY) return null

    try {
        const itemList = type === 'coins'
            ? topItems.map(c => `${c.name} (${c.symbol})`).join(', ')
            : topItems.map(n => `"${n.title}"`).join(', ')

        const prompt = `Based on this user profile and the personalized sorting I just performed, write ONE short sentence (max 15 words) summarizing what I prioritized:

${context}

Top ${type === 'coins' ? 'coins' : 'news items'}: ${itemList}

Write a cool, concise sentence starting with "Prioritized" or "Highlighted" or "Focused on". Example: "Prioritized Bitcoin and Ethereum based on your conservative investment style and voting history."`

        const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 50
                }
            })
        })

        if (!response.ok) return null

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        return text?.trim() || null
    } catch (error) {
        loggerService.error(`Error generating summary: ${error}`)
        return null
    }
}

// Fallback: Simple relevance-based sorting without AI
function sortCoinsByRelevance(coins, user) {
    if (!user || !coins) return coins || []

    const upVotedCoinIds = new Set()
    const favCoins = new Set((user.preferences?.['fav-coins'] || []).map(c => c.toLowerCase()))

    if (user.votes) {
        user.votes.forEach(v => {
            if (v.type === 'coin' && v.vote === 'up') {
                const coinId = typeof v.content === 'object' ? v.content?.id : v.content
                if (coinId) upVotedCoinIds.add(coinId.toLowerCase())
            }
        })
    }

    return [...coins].sort((a, b) => {
        const aVoted = upVotedCoinIds.has(a.id?.toLowerCase())
        const bVoted = upVotedCoinIds.has(b.id?.toLowerCase())
        const aFav = favCoins.has(a.name?.toLowerCase()) || favCoins.has(a.symbol?.toLowerCase())
        const bFav = favCoins.has(b.name?.toLowerCase()) || favCoins.has(b.symbol?.toLowerCase())

        // Prioritize: voted > favorite > market cap
        if (aVoted && !bVoted) return -1
        if (!aVoted && bVoted) return 1
        if (aFav && !bFav) return -1
        if (!aFav && bFav) return 1

        return (b.market_cap || 0) - (a.market_cap || 0)
    })
}

function sortNewsByRelevance(newsItems, user) {
    if (!user || !newsItems) return newsItems || []

    const upVotedTitles = new Set()
    const favCoins = new Set((user.preferences?.['fav-coins'] || []).map(c => c.toLowerCase()))

    if (user.votes) {
        user.votes.forEach(v => {
            if (v.type === 'news' && v.vote === 'up') {
                const title = typeof v.content === 'object' ? v.content?.title : v.content
                if (title) upVotedTitles.add(title.toLowerCase())
            }
        })
    }

    return [...newsItems].sort((a, b) => {
        const aVoted = upVotedTitles.has(a.title?.toLowerCase())
        const bVoted = upVotedTitles.has(b.title?.toLowerCase())

        // Check if news mentions favorite coins
        const aRelevant = favCoins.size > 0 && Array.from(favCoins).some(coin =>
            a.title?.toLowerCase().includes(coin) || a.description?.toLowerCase().includes(coin)
        )
        const bRelevant = favCoins.size > 0 && Array.from(favCoins).some(coin =>
            b.title?.toLowerCase().includes(coin) || b.description?.toLowerCase().includes(coin)
        )

        // Prioritize: voted > mentions fav coins > date
        if (aVoted && !bVoted) return -1
        if (!aVoted && bVoted) return 1
        if (aRelevant && !bRelevant) return -1
        if (!aRelevant && bRelevant) return 1

        return new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0)
    })
}

function buildUserContext(user) {
    if (!user) return 'No user profile available.'

    let context = `User Profile:
- Investor Type: ${user.preferences?.['investor-type'] || 'Not specified'}
- Favorite Coins: ${user.preferences?.['fav-coins']?.join(', ') || 'None'}
- Content Preferences: ${user.preferences?.['content-type']?.join(', ') || 'None'}
`

    if (user.votes && user.votes.length > 0) {
        const upVotes = user.votes.filter(v => v.vote === 'up')
        const downVotes = user.votes.filter(v => v.vote === 'down')

        if (upVotes.length > 0) {
            context += `\nLiked: ${upVotes.map(v => {
                if (v.type === 'coin') return v.content?.name || v.content?.id || v.content
                return v.content?.title || v.content
            }).join(', ')}\n`
        }

        if (downVotes.length > 0) {
            context += `Disliked: ${downVotes.map(v => {
                if (v.type === 'coin') return v.content?.name || v.content?.id || v.content
                return v.content?.title || v.content
            }).join(', ')}\n`
        }
    }

    return context
}
