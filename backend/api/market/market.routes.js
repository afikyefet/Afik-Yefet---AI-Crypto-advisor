import express from 'express'
import {
    getCoinPrices,
    getCoinsList,
    getSupportedCurrencies,
    getNews,
    getTrendingNews,
    getHotNews,
    pingCoinGecko
} from './market.controller.js'

const router = express.Router()

router.get('/prices', getCoinPrices)
router.get('/coins', getCoinsList)
router.get('/currencies', getSupportedCurrencies)
router.get('/ping', pingCoinGecko)

router.get('/news', getNews)
router.get('/news/trending', getTrendingNews)
router.get('/news/hot', getHotNews)

export const marketRoutes = router
