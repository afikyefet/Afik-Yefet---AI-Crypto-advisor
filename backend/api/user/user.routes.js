import express from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import { addVote, completeOnboarding, updateUserPreferences } from './user.controller.js'

const router = express.Router()

router.use(requireAuth)

router.put('/:userId/preferences', updateUserPreferences)
router.put('/:userId/complete-onboarding', completeOnboarding)
router.post('/:userId/add-vote', addVote)

export const userRoutes = router
