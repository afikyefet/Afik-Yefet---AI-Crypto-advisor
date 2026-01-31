import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'
import { aiService } from './ai.service.js'

export async function sortUserCoins(req, res) {
    try {
        const { userId } = req.params
        const { coins } = req.body

        if (!coins || !Array.isArray(coins)) {
            return res.status(400).send({ err: 'Coins array is required' })
        }

        const user = await userService.getById(userId)
        const sortedCoins = await aiService.sortCoins(coins, user)
        res.json({ coins: sortedCoins })
    } catch (err) {
        loggerService.error('Cannot sort coins', err)
        res.status(400).send({ err: err.message || 'Cannot sort coins' })
    }
}

export async function sortUserNews(req, res) {
    try {
        const { userId } = req.params
        const { news } = req.body

        if (!news || !Array.isArray(news)) {
            return res.status(400).send({ err: 'News array is required' })
        }

        const user = await userService.getById(userId)
        const sortedNews = await aiService.sortNews(news, user)
        res.json({ news: sortedNews })
    } catch (err) {
        loggerService.error('Cannot sort news', err)
        res.status(400).send({ err: err.message || 'Cannot sort news' })
    }
}
