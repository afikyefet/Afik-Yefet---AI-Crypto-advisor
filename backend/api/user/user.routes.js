import express from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'
import { addUser, addVote, completeOnboarding, getUser, updateUser, updateUserPreferences } from './user.controller.js'

const router = express.Router()

router.use(requireAuth)

router.get('/:userId', getUser)
router.post('/', addUser)
router.put('/', updateUser)
router.put('/:userId/preferences', updateUserPreferences)
router.put('/:userId/complete-onboarding', completeOnboarding)
router.post('/:userId/add-vote', addVote)
// router.get('/', getUsers)
// router.delete('/:userId', removeUser)

export const userRoutes = router
