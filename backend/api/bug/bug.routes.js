import express from 'express'
import { addBug, getBug, getBugs, removeBug, updateBug } from './bug.controller.js'
import { log } from '../../middlewares/log.middleware.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getBugs)
router.get('/:bugId', getBug)
router.delete('/:bugId', requireAuth, removeBug)
router.post('/', requireAuth, addBug)
router.put('/', requireAuth, updateBug)

export const bugRoutes = router