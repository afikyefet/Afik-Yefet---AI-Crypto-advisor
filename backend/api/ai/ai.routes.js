import express from 'express'
import { sortUserCoins, sortUserNews } from './ai.controller.js'

const router = express.Router()

router.post('/:userId/sort-coins', sortUserCoins)
router.post('/:userId/sort-news', sortUserNews)

export const aiRoutes = router
