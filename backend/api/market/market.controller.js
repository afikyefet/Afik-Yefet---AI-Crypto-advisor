import { loggerService } from '../../services/logger.service.js'
import { marketService } from './market.service.js'

export async function getCoinsMarketData(req, res) {
    try {
        const data = await marketService.getCoinsMarketData(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get coins market data', err)
        res.status(400).send({ err: 'Cannot get coins market data' })
    }
}

export async function getStaticNews(req, res) {
    try {
        const data = await marketService.getStaticNews()
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get static news', err)
        res.status(400).send({ err: 'Cannot get static news' })
    }
}

export async function getRelevantNews(req, res) {
    try {
        const data = await marketService.getRelevantNews(req.loggedinUser._id)
        if (!data) {
            return res.status(404).send({ err: 'No relevant news found' })
        }
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get relevant news', err)
        res.status(400).send({ err: 'Cannot get relevant news' })
    }
}

export async function getMeme(req, res) {
    try {
        const data = await marketService.getMeme()
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get meme', err)
        res.status(400).send({ err: 'Cannot get meme' })
    }
}
