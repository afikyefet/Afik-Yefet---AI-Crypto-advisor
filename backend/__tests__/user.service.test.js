import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { ObjectId } from 'mongodb'

// Mock dbService
const mockCollection = {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
}

const mockDbService = {
    getCollection: jest.fn(() => Promise.resolve(mockCollection))
}

// Mock loggerService
const mockLoggerService = {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
}

jest.unstable_mockModule('../services/db.service.js', () => ({
    dbService: mockDbService
}))

jest.unstable_mockModule('../services/logger.service.js', () => ({
    loggerService: mockLoggerService
}))

// Import after mocking
const { userService } = await import('../api/user/user.service.js')

describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCollection.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
        })
    })

    describe('query', () => {
        it('should return all users', async () => {
            const mockUsers = [
                { _id: '1', name: 'User 1', email: 'user1@test.com' },
                { _id: '2', name: 'User 2', email: 'user2@test.com' }
            ]
            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockUsers)
            })

            const result = await userService.query()

            expect(mockDbService.getCollection).toHaveBeenCalledWith('user')
            expect(result).toEqual(mockUsers)
        })

        it('should throw error on database failure', async () => {
            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockRejectedValue(new Error('DB error'))
            })

            await expect(userService.query()).rejects.toThrow('DB error')
            expect(mockLoggerService.error).toHaveBeenCalled()
        })
    })

    describe('getByEmail', () => {
        it('should return user by email', async () => {
            const mockUser = { _id: '123', email: 'test@test.com', name: 'Test' }
            mockCollection.findOne.mockResolvedValue(mockUser)

            const result = await userService.getByEmail('test@test.com')

            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@test.com' })
            expect(result).toEqual(mockUser)
        })

        it('should return null for non-existent email', async () => {
            mockCollection.findOne.mockResolvedValue(null)

            const result = await userService.getByEmail('nonexistent@test.com')

            expect(result).toBeNull()
        })
    })

    describe('getById', () => {
        it('should return user by id', async () => {
            const userId = new ObjectId().toString()
            const mockUser = { _id: userId, name: 'Test', email: 'test@test.com' }
            mockCollection.findOne.mockResolvedValue(mockUser)

            const result = await userService.getById(userId)

            expect(result).toEqual(mockUser)
        })

        it('should throw error for invalid user id', async () => {
            const userId = new ObjectId().toString()
            mockCollection.findOne.mockResolvedValue(null)

            await expect(userService.getById(userId))
                .rejects.toThrow(`Bad user id: ${userId}`)
        })
    })

    describe('remove', () => {
        it('should delete user by id', async () => {
            const userId = new ObjectId().toString()
            mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 })

            await userService.remove(userId)

            expect(mockCollection.deleteOne).toHaveBeenCalled()
        })

        it('should throw error if user not found', async () => {
            const userId = new ObjectId().toString()
            mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 })

            await expect(userService.remove(userId))
                .rejects.toThrow(`Bad user id: ${userId}`)
        })
    })

    describe('save', () => {
        it('should insert new user when no _id provided', async () => {
            const newUser = { name: 'New User', email: 'new@test.com' }
            const insertedId = new ObjectId()
            mockCollection.insertOne.mockResolvedValue({ insertedId })

            const result = await userService.save(newUser)

            expect(mockCollection.insertOne).toHaveBeenCalledWith(newUser)
            expect(result._id).toBe(insertedId.toString())
        })

        it('should update existing user when _id is provided', async () => {
            const userId = new ObjectId().toString()
            const existingUser = { _id: userId, name: 'Updated User', email: 'update@test.com' }
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.save(existingUser)

            expect(mockCollection.updateOne).toHaveBeenCalled()
            expect(result).toEqual(existingUser)
        })

        it('should throw error if update fails to match user', async () => {
            const userId = new ObjectId().toString()
            const user = { _id: userId, name: 'Test' }
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 })

            await expect(userService.save(user))
                .rejects.toThrow(`Bad user id: ${userId}`)
        })
    })

    describe('updatePreferences', () => {
        it('should update user preferences', async () => {
            const userId = new ObjectId().toString()
            const preferences = { 'fav-coins': ['bitcoin', 'ethereum'] }
            const updatedUser = { _id: userId, preferences }

            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })
            mockCollection.findOne.mockResolvedValue(updatedUser)

            const result = await userService.updatePreferences(userId, preferences)

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                expect.anything(),
                { $set: { preferences } }
            )
            expect(result).toEqual(updatedUser)
        })

        it('should throw error for non-existent user', async () => {
            const userId = new ObjectId().toString()
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 })

            await expect(userService.updatePreferences(userId, {}))
                .rejects.toThrow(`Bad user id: ${userId}`)
        })
    })

    describe('markOnboardingComplete', () => {
        it('should set hasCompletedOnboarding to true', async () => {
            const userId = new ObjectId().toString()
            const updatedUser = { _id: userId, hasCompletedOnboarding: true }

            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })
            mockCollection.findOne.mockResolvedValue(updatedUser)

            const result = await userService.markOnboardingComplete(userId)

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                expect.anything(),
                { $set: { hasCompletedOnboarding: true } }
            )
            expect(result.hasCompletedOnboarding).toBe(true)
        })
    })

    describe('addVote', () => {
        it('should add new vote for coin', async () => {
            const userId = new ObjectId().toString()
            const mockUser = { _id: userId, votes: [] }
            const voteData = {
                type: 'coin',
                vote: 'up',
                content: { id: 'bitcoin', name: 'Bitcoin' }
            }

            mockCollection.findOne
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ ...mockUser, votes: [voteData] })
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.addVote(userId, voteData)

            expect(result.votes).toContainEqual(voteData)
        })

        it('should remove vote if same vote is clicked again', async () => {
            const userId = new ObjectId().toString()
            const existingVote = {
                type: 'coin',
                vote: 'up',
                content: { id: 'bitcoin' }
            }
            const mockUser = { _id: userId, votes: [existingVote] }

            mockCollection.findOne
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ ...mockUser, votes: [] })
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.addVote(userId, existingVote)

            expect(result.votes).toEqual([])
        })

        it('should switch vote if different vote on same content', async () => {
            const userId = new ObjectId().toString()
            const existingVote = {
                type: 'coin',
                vote: 'up',
                content: { id: 'bitcoin' }
            }
            const newVote = {
                type: 'coin',
                vote: 'down',
                content: { id: 'bitcoin' }
            }
            const mockUser = { _id: userId, votes: [existingVote] }

            mockCollection.findOne
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ ...mockUser, votes: [newVote] })
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.addVote(userId, newVote)

            expect(result.votes).toHaveLength(1)
            expect(result.votes[0].vote).toBe('down')
        })

        it('should add news vote using title as identifier', async () => {
            const userId = new ObjectId().toString()
            const mockUser = { _id: userId, votes: [] }
            const voteData = {
                type: 'news',
                vote: 'up',
                content: { title: 'Bitcoin hits new high', id: '123' }
            }

            mockCollection.findOne
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ ...mockUser, votes: [voteData] })
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.addVote(userId, voteData)

            expect(result.votes).toContainEqual(voteData)
        })

        it('should throw error for non-existent user', async () => {
            const userId = new ObjectId().toString()
            mockCollection.findOne.mockResolvedValue(null)

            await expect(userService.addVote(userId, { type: 'coin', vote: 'up', content: {} }))
                .rejects.toThrow(`Bad user id: ${userId}`)
        })

        it('should initialize votes array if user has none', async () => {
            const userId = new ObjectId().toString()
            const mockUser = { _id: userId } // No votes property
            const voteData = { type: 'coin', vote: 'up', content: { id: 'bitcoin' } }

            mockCollection.findOne
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ ...mockUser, votes: [voteData] })
            mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 })

            const result = await userService.addVote(userId, voteData)

            expect(result.votes).toBeDefined()
        })
    })
})
