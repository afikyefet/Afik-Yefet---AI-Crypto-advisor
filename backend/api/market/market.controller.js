import { loggerService } from '../../services/logger.service.js'
import { marketService } from './market.service.js'

export async function getCoinPrices(req, res) {
    try {
        const data = await marketService.getCoinPrices(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get coin prices', err)
        res.status(400).send({ err: 'Cannot get coin prices' })
    }
}

export async function getCoinsMarketData(req, res) {
    try {
        const data = await marketService.getCoinsMarketData(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get coins market data', err)
        res.status(400).send({ err: 'Cannot get coins market data' })
    }
}
export async function getCoinsList(req, res) {
    try {
        const data = await marketService.getCoinsList()
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get coins list', err)
        res.status(400).send({ err: 'Cannot get coins list' })
    }
}

export async function getSupportedCurrencies(req, res) {
    try {
        const data = await marketService.getSupportedCurrencies()
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get supported currencies', err)
        res.status(400).send({ err: 'Cannot get supported currencies' })
    }
}

export async function pingCoinGecko(req, res) {
    try {
        const data = await marketService.pingCoinGecko()
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot ping CoinGecko', err)
        res.status(400).send({ err: 'Cannot ping CoinGecko' })
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

export async function getNews(req, res) {
    try {
        const data = await marketService.getNews(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get news', err)
        res.status(400).send({ err: 'Cannot get news' })
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
