import express from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import { getDailyInsight, getRelevantCoins } from './ai.controller.js'

const router = express.Router()

router.use(requireAuth)

router.get('/:userId/daily-insight', getDailyInsight)
router.get('/:userId/relevant-coins', getRelevantCoins)
export const aiRoutes = router
