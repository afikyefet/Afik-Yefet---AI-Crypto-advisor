import { loggerService } from "../../services/logger.service.js";
import { userService } from "./user.service.js";

function ensureOwner(req, res, userId) {
  const loggedInId = req.loggedinUser?._id
  if (!loggedInId) {
    res.status(401).send({ err: 'Login first!' })
    return false
  }
  if (loggedInId !== userId) {
    res.status(403).send({ err: 'Not allowed' })
    return false
  }
  return true
}

function sanitizeUser(user) {
  if (!user) return user
  const { password, ...safeUser } = user
  return {
    ...safeUser,
    _id: safeUser._id?.toString ? safeUser._id.toString() : safeUser._id,
    votes: safeUser.votes || []
  }
}

export async function getUsers(req, res) {
  try {
    const userId = req.loggedinUser?._id
    if (!userId) return res.status(401).send({ err: 'Login first!' })
    const user = await userService.getById(userId)
    res.send([sanitizeUser(user)])
  } catch (err) {
    loggerService.error('Cannot get users', err)
    res.status(400).send('Cannot get users')
  }
}

export async function getUser(req, res) {
  try {
    const { userId } = req.params;
    if (!ensureOwner(req, res, userId)) return
    const user = await userService.getById(userId);
    if (!user) throw new Error(`User not found for id: ${userId}`);
    res.send(sanitizeUser(user));
  } catch (err) {
    loggerService.error('Cannot get user', err);
    res.status(400).send('Cannot get user');
  }
}


export async function addUser(req, res) {
  try {
    res.status(403).send({ err: 'Use /api/auth/signup instead' })
  } catch (err) {
    loggerService.error('Cannot add user', err)
    res.status(400).send('Cannot add user')
  }
}

export async function updateUser(req, res) {
  try {
    const { _id, fullname, email, password } = req.body
    if (!ensureOwner(req, res, _id)) return
    const userToSave = { _id, fullname, email, password }
    const savedUser = await userService.save(userToSave)
    res.send(sanitizeUser(savedUser))
  } catch (err) {
    loggerService.error('Cannot update user', err)
    res.status(400).send('Cannot update user')
  }
}

export async function removeUser(req, res) {
  try {
    const { userId } = req.params
    if (!ensureOwner(req, res, userId)) return
    await userService.remove(userId)
    res.send('User removed')
  } catch (err) {
    loggerService.error('Cannot remove user', err)
    res.status(400).send('Cannot remove user')
  }
}

export async function updateUserPreferences(req, res) {
  try {
    const { userId } = req.params
    const { preferences } = req.body

    if (!ensureOwner(req, res, userId)) return

    if (!preferences) {
      return res.status(400).send({ err: 'Preferences are required' })
    }

    // Validate preferences structure
    if (preferences['fav-coins'] && !Array.isArray(preferences['fav-coins'])) {
      return res.status(400).send({ err: 'fav-coins must be an array' })
    }
    
    // investor-type must be an array
    if (preferences['investor-type'] !== undefined) {
      if (!Array.isArray(preferences['investor-type'])) {
        return res.status(400).send({ err: 'investor-type must be an array' })
      }
      if (preferences['investor-type'].length !== 1) {
        return res.status(400).send({ err: 'investor-type must have exactly 1 selection' })
      }
    } else {
      // Ensure it's always an array, even if empty
      preferences['investor-type'] = []
    }

    if (preferences['content-type'] !== undefined && !Array.isArray(preferences['content-type'])) {
      return res.status(400).send({ err: 'content-type must be an array' })
    }
    if (preferences['content-type'] !== undefined && Array.isArray(preferences['content-type']) && preferences['content-type'].length !== 1) {
      return res.status(400).send({ err: 'content-type must have exactly 1 selection' })
    } else if (preferences['content-type'] === undefined) {
      preferences['content-type'] = []
    }

    const updatedUser = await userService.updatePreferences(userId, preferences)

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    res.json({
      _id: userWithoutPassword._id?.toString ? userWithoutPassword._id.toString() : userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      preferences: userWithoutPassword.preferences,
      hasCompletedOnboarding: userWithoutPassword.hasCompletedOnboarding,
      votes: userWithoutPassword.votes || []
    })
  } catch (err) {
    loggerService.error('Cannot update user preferences', err)
    res.status(400).send({ err: 'Cannot update user preferences' })
  }
}

export async function completeOnboarding(req, res) {
  try {
    const { userId } = req.params
    if (!ensureOwner(req, res, userId)) return
    const updatedUser = await userService.markOnboardingComplete(userId)

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    res.json({
      _id: userWithoutPassword._id?.toString ? userWithoutPassword._id.toString() : userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      preferences: userWithoutPassword.preferences,
      hasCompletedOnboarding: userWithoutPassword.hasCompletedOnboarding,
      votes: userWithoutPassword.votes || []
    })
  } catch (err) {
    loggerService.error('Cannot complete onboarding', err)
    res.status(400).send({ err: 'Cannot complete onboarding' })
  }
}

export async function addVote(req, res) {
  try {
    const { userId } = req.params
    const { vote, type, content } = req.body

    if (!ensureOwner(req, res, userId)) return

    if (!vote || !type || !content) {
      return res.status(400).send({ err: 'Vote, type, and content are required' })
    }

    if (vote !== 'up' && vote !== 'down') {
      return res.status(400).send({ err: 'Vote must be "up" or "down"' })
    }

    if (type !== 'coin' && type !== 'news') {
      return res.status(400).send({ err: 'Type must be "coin" or "news"' })
    }

    // Validate content has required identifier based on type
    if (type === 'coin' && typeof content === 'object' && !content.id) {
      return res.status(400).send({ err: 'Coin content must have an id field' })
    }
    if (type === 'news' && typeof content === 'object' && !content.title && !content.id) {
      return res.status(400).send({ err: 'News content must have a title or id field' })
    }

    const voteData = { vote, type, content }
    const updatedUser = await userService.addVote(userId, voteData)

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    res.json({
      _id: userWithoutPassword._id?.toString ? userWithoutPassword._id.toString() : userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      preferences: userWithoutPassword.preferences,
      hasCompletedOnboarding: userWithoutPassword.hasCompletedOnboarding,
      votes: userWithoutPassword.votes || []
    })
  } catch (err) {
    loggerService.error('Cannot add vote', err)
    res.status(400).send({ err: 'Cannot add vote' })
  }
}
