import express from 'express'
import { addUser, addVote, completeOnboarding, getUser, getUsers, removeUser, updateUser, updateUserPreferences } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.post('/', addUser)
router.put('/', updateUser)
router.put('/:userId/preferences', updateUserPreferences)
router.put('/:userId/complete-onboarding', completeOnboarding)
router.post('/:userId/add-vote', addVote)
router.delete('/:userId', removeUser)

export const userRoutes = router