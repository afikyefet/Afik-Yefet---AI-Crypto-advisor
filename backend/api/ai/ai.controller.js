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
        const result = await aiService.sortCoins(coins, user)
        res.json({ coins: result.coins, summary: result.summary })
    } catch (err) {
        loggerService.error('Cannot sort coins', err)
        res.status(400).send({ err: err.message || 'Cannot sort coins' })
    }
}

export async function getDailyInsight(req, res) {
    try {
        const { userId } = req.params
        const force = req.query?.force === 'true'
        const result = await aiService.getDailyInsight(userId, { force })
        res.json({ insight: result.insight })
    } catch (err) {
        loggerService.error('Cannot get daily insight', err)
        res.status(400).send({ err: err.message || 'Cannot get daily insight' })
    }
}
