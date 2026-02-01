import express from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import {
    getCoinPrices,
    getCoinsList,
    getCoinsMarketData,
    getMeme,
    getNews,
    getRelevantNews,
    getSupportedCurrencies,
    pingCoinGecko
} from './market.controller.js'

const router = express.Router()

router.use(requireAuth)

router.get('/prices', getCoinPrices)
router.get('/coins', getCoinsList)
router.get('/currencies', getSupportedCurrencies)
router.get('/ping', pingCoinGecko)
router.get('/market-data', getCoinsMarketData)
router.get('/news/relevant', getRelevantNews)
router.get('/news', getNews)

router.get('/meme', getMeme)

export const marketRoutes = router
