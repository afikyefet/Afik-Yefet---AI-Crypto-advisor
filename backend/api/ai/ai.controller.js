import { loggerService } from '../../services/logger.service.js'
import { aiService } from './ai.service.js'

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

export async function getRelevantCoins(req, res) {
    try {
        const { userId } = req.params
        const result = await aiService.getRelevantCoins(userId)
        res.json({ coins: result })
    } catch (err) {
        loggerService.error('Cannot get relevant coins', err)
        res.status(400).send({ err: err.message || 'Cannot get relevant coins' })
    }
}
