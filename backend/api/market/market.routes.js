import express from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import {
    getCoinsMarketData,
    getMeme,
    getRelevantNews
} from './market.controller.js'

const router = express.Router()

router.use(requireAuth)

router.get('/market-data', getCoinsMarketData)
router.get('/news/relevant', getRelevantNews)

router.get('/meme', getMeme)

export const marketRoutes = router
