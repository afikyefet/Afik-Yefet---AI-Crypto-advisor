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
    const { fullname, username, password, score } = req.body
    const userToSave = { fullname, username, password, score }
    const savedUser = await userService.save(userToSave)
    res.send(savedUser)
  } catch (err) {
    loggerService.error('Cannot add user', err)
    res.status(400).send('Cannot add user')
  }
}

export async function updateUser(req, res) {
  try {
    const { _id, fullname, username, password, score } = req.body
    const userToSave = { _id, fullname, username, password, score }
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