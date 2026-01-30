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

export async function getNews(req, res) {
    try {
        const data = await marketService.getNews(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get news', err)
        res.status(400).send({ err: 'Cannot get news' })
    }
}

export async function getTrendingNews(req, res) {
    try {
        const data = await marketService.getTrendingNews(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get trending news', err)
        res.status(400).send({ err: 'Cannot get trending news' })
    }
}

export async function getHotNews(req, res) {
    try {
        const data = await marketService.getHotNews(req.query)
        res.send(data)
    } catch (err) {
        loggerService.error('Cannot get hot news', err)
        res.status(400).send({ err: 'Cannot get hot news' })
    }
}
