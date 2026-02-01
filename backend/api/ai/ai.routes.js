import express from 'express'
import { getDailyInsight, sortUserCoins } from './ai.controller.js'

const router = express.Router()

router.post('/:userId/sort-coins', sortUserCoins)
router.get('/:userId/daily-insight', getDailyInsight)

export const aiRoutes = router
