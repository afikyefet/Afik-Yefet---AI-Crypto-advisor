import express from 'express'
import { getDailyInsight, sortUserCoins, sortUserNews } from './ai.controller.js'

const router = express.Router()

router.post('/:userId/sort-coins', sortUserCoins)
router.post('/:userId/sort-news', sortUserNews)
router.get('/:userId/daily-insight', getDailyInsight)

export const aiRoutes = router
