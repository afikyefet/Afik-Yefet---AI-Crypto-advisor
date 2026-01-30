import { ObjectId } from 'mongodb';
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";

const COLLECTION_NAME = 'user'

export const userService = {
    query,
    getById,
    save,
    remove,
    getByEmail,
    updatePreferences,
    markOnboardingComplete
};

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const users = await collection.find({}).toArray()
        return users
    } catch (error) {
        loggerService.error(`Couldn't get users: ${error}`)
        throw error
    }
}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        loggerService.error('userService[getByEmail] : ', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        if (!user) throw new Error(`Bad user id: ${userId}`)
        return user
    } catch (error) {
        loggerService.error(`Couldn't get user with id ${userId}: ${error}`)
        throw error
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const result = await collection.deleteOne({ _id: new ObjectId(userId) })
        if (result.deletedCount === 0) throw new Error(`Bad user id: ${userId}`)
    } catch (error) {
        loggerService.error(`Error in userService.remove: ${error}`)
        throw error
    }
}

async function save(user) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)

        if (user._id) {
            // Update existing user
            const { _id, ...userData } = user
            const result = await collection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: userData }
            )
            if (result.matchedCount === 0) throw new Error(`Bad user id: ${user._id}`)
            return user
        } else {
            // Insert new user
            const result = await collection.insertOne(user)
            return { ...user, _id: result.insertedId.toString() }
        }
    } catch (error) {
        loggerService.error(`Error in userService.save: ${error}`)
        throw error
    }
}

async function updatePreferences(userId, preferences) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { preferences } }
        )
        if (result.matchedCount === 0) throw new Error(`Bad user id: ${userId}`)

        const updatedUser = await collection.findOne({ _id: new ObjectId(userId) })
        return updatedUser
    } catch (error) {
        loggerService.error(`Error in userService.updatePreferences: ${error}`)
        throw error
    }
}

async function markOnboardingComplete(userId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { hasCompletedOnboarding: true } }
        )
        if (result.matchedCount === 0) throw new Error(`Bad user id: ${userId}`)

        const updatedUser = await collection.findOne({ _id: new ObjectId(userId) })
        return updatedUser
    } catch (error) {
        loggerService.error(`Error in userService.markOnboardingComplete: ${error}`)
        throw error
    }
}