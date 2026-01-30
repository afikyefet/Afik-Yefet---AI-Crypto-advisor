import { loggerService } from "../../services/logger.service.js";
import { userService } from "./user.service.js";

export async function getUsers(req, res) {
  try {
    const users = await userService.query()
    res.send(users)
  } catch (err) {
    loggerService.error('Cannot get users', err)
    res.status(400).send('Cannot get users')
  }
}

export async function getUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await userService.getById(userId);
    if (!user) throw new Error(`User not found for id: ${userId}`);
    res.send(user);
  } catch (err) {
    loggerService.error('Cannot get user', err);
    res.status(400).send('Cannot get user');
  }
}


export async function addUser(req, res) {
  try {
    const { fullname, email, password } = req.body
    const userToSave = { fullname, email, password }
    const savedUser = await userService.save(userToSave)
    res.send(savedUser)
  } catch (err) {
    loggerService.error('Cannot add user', err)
    res.status(400).send('Cannot add user')
  }
}

export async function updateUser(req, res) {
  try {
    const { _id, fullname, email, password } = req.body
    const userToSave = { _id, fullname, email, password }
    const savedUser = await userService.save(userToSave)
    res.send(savedUser)
  } catch (err) {
    loggerService.error('Cannot update user', err)
    res.status(400).send('Cannot update user')
  }
}

export async function removeUser(req, res) {
  try {
    const { userId } = req.params
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

    if (!preferences) {
      return res.status(400).send({ err: 'Preferences are required' })
    }

    // Validate preferences structure
    if (preferences['fav-coins'] && !Array.isArray(preferences['fav-coins'])) {
      return res.status(400).send({ err: 'fav-coins must be an array' })
    }
    if (preferences['investor-type'] && typeof preferences['investor-type'] !== 'string') {
      return res.status(400).send({ err: 'investor-type must be a string' })
    }
    if (preferences['content-type'] && !Array.isArray(preferences['content-type'])) {
      return res.status(400).send({ err: 'content-type must be an array' })
    }

    const updatedUser = await userService.updatePreferences(userId, preferences)

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    res.json({
      _id: userWithoutPassword._id?.toString ? userWithoutPassword._id.toString() : userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      preferences: userWithoutPassword.preferences,
      hasCompletedOnboarding: userWithoutPassword.hasCompletedOnboarding
    })
  } catch (err) {
    loggerService.error('Cannot update user preferences', err)
    res.status(400).send({ err: 'Cannot update user preferences' })
  }
}

export async function completeOnboarding(req, res) {
  try {
    const { userId } = req.params
    const updatedUser = await userService.markOnboardingComplete(userId)

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    res.json({
      _id: userWithoutPassword._id?.toString ? userWithoutPassword._id.toString() : userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      preferences: userWithoutPassword.preferences,
      hasCompletedOnboarding: userWithoutPassword.hasCompletedOnboarding
    })
  } catch (err) {
    loggerService.error('Cannot complete onboarding', err)
    res.status(400).send({ err: 'Cannot complete onboarding' })
  }
}