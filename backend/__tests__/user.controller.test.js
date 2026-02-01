import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock userService
const mockUserService = {
    query: jest.fn(),
    getById: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    updatePreferences: jest.fn(),
    markOnboardingComplete: jest.fn(),
    addVote: jest.fn()
}

// Mock loggerService
const mockLoggerService = {
    error: jest.fn(),
    info: jest.fn()
}

jest.unstable_mockModule('../api/user/user.service.js', () => ({
    userService: mockUserService
}))

jest.unstable_mockModule('../services/logger.service.js', () => ({
    loggerService: mockLoggerService
}))

// Import controller after mocking
const {
    getUsers,
    getUser,
    addUser,
    updateUser,
    removeUser,
    updateUserPreferences,
    completeOnboarding,
    addVote
} = await import('../api/user/user.controller.js')

// Helper to create mock request/response
function createMockReqRes(overrides = {}) {
    const req = {
        params: {},
        body: {},
        cookies: {},
        loggedinUser: null,
        ...overrides
    }
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    }
    return { req, res }
}

describe('User Controller - Security Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('ensureOwner security', () => {
        describe('getUser', () => {
            it('should return 401 if user is not logged in', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: '123' },
                    loggedinUser: null
                })

                await getUser(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
                expect(res.send).toHaveBeenCalledWith({ err: 'Login first!' })
            })

            it('should return 403 if user tries to access another users data', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: 'other-user-id' },
                    loggedinUser: { _id: 'logged-in-user-id' }
                })

                await getUser(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
                expect(res.send).toHaveBeenCalledWith({ err: 'Not allowed' })
            })

            it('should allow access when user owns the resource', async () => {
                const userId = '123'
                const mockUser = {
                    _id: userId,
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'hashedPassword'
                }
                mockUserService.getById.mockResolvedValue(mockUser)

                const { req, res } = createMockReqRes({
                    params: { userId },
                    loggedinUser: { _id: userId }
                })

                await getUser(req, res)

                expect(mockUserService.getById).toHaveBeenCalledWith(userId)
                expect(res.send).toHaveBeenCalled()
                // Should not include password
                const sentData = res.send.mock.calls[0][0]
                expect(sentData.password).toBeUndefined()
            })
        })

        describe('updateUser', () => {
            it('should return 401 if not logged in', async () => {
                const { req, res } = createMockReqRes({
                    body: { _id: '123', fullname: 'Test' },
                    loggedinUser: null
                })

                await updateUser(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
            })

            it('should return 403 if trying to update another user', async () => {
                const { req, res } = createMockReqRes({
                    body: { _id: 'other-user-id', fullname: 'Test' },
                    loggedinUser: { _id: 'my-user-id' }
                })

                await updateUser(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
                expect(res.send).toHaveBeenCalledWith({ err: 'Not allowed' })
            })

            it('should allow user to update their own data', async () => {
                const userId = '123'
                const updatedUser = {
                    _id: userId,
                    fullname: 'Updated Name',
                    email: 'test@test.com'
                }
                mockUserService.save.mockResolvedValue(updatedUser)

                const { req, res } = createMockReqRes({
                    body: { _id: userId, fullname: 'Updated Name', email: 'test@test.com' },
                    loggedinUser: { _id: userId }
                })

                await updateUser(req, res)

                expect(mockUserService.save).toHaveBeenCalled()
                expect(res.send).toHaveBeenCalled()
            })
        })

        describe('removeUser', () => {
            it('should return 401 if not logged in', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: '123' },
                    loggedinUser: null
                })

                await removeUser(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
            })

            it('should return 403 if trying to delete another user', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: 'other-user-id' },
                    loggedinUser: { _id: 'my-user-id' }
                })

                await removeUser(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
            })

            it('should allow user to delete their own account', async () => {
                const userId = '123'
                mockUserService.remove.mockResolvedValue()

                const { req, res } = createMockReqRes({
                    params: { userId },
                    loggedinUser: { _id: userId }
                })

                await removeUser(req, res)

                expect(mockUserService.remove).toHaveBeenCalledWith(userId)
                expect(res.send).toHaveBeenCalledWith('User removed')
            })
        })

        describe('updateUserPreferences', () => {
            it('should return 401 if not logged in', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: '123' },
                    body: { preferences: {} },
                    loggedinUser: null
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
            })

            it('should return 403 if trying to update another users preferences', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: 'other-user-id' },
                    body: { preferences: {} },
                    loggedinUser: { _id: 'my-user-id' }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
            })
        })

        describe('completeOnboarding', () => {
            it('should return 401 if not logged in', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: '123' },
                    loggedinUser: null
                })

                await completeOnboarding(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
            })

            it('should return 403 if trying to complete onboarding for another user', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: 'other-user-id' },
                    loggedinUser: { _id: 'my-user-id' }
                })

                await completeOnboarding(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
            })
        })

        describe('addVote', () => {
            it('should return 401 if not logged in', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: '123' },
                    body: { vote: 'up', type: 'coin', content: { id: 'bitcoin' } },
                    loggedinUser: null
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(401)
            })

            it('should return 403 if trying to add vote for another user', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId: 'other-user-id' },
                    body: { vote: 'up', type: 'coin', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: 'my-user-id' }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(403)
            })
        })
    })

    describe('sanitizeUser - password removal', () => {
        it('should not return password in getUser response', async () => {
            const userId = '123'
            const mockUser = {
                _id: userId,
                name: 'Test',
                email: 'test@test.com',
                password: 'secretHashedPassword',
                preferences: {}
            }
            mockUserService.getById.mockResolvedValue(mockUser)

            const { req, res } = createMockReqRes({
                params: { userId },
                loggedinUser: { _id: userId }
            })

            await getUser(req, res)

            const sentData = res.send.mock.calls[0][0]
            expect(sentData.password).toBeUndefined()
            expect(sentData.name).toBe('Test')
            expect(sentData.email).toBe('test@test.com')
        })

        it('should not return password in updateUserPreferences response', async () => {
            const userId = '123'
            const mockUser = {
                _id: userId,
                name: 'Test',
                email: 'test@test.com',
                password: 'secretHashedPassword',
                preferences: { 'fav-coins': ['bitcoin'] },
                hasCompletedOnboarding: false
            }
            mockUserService.updatePreferences.mockResolvedValue(mockUser)

            const { req, res } = createMockReqRes({
                params: { userId },
                body: { preferences: { 'fav-coins': ['bitcoin'] } },
                loggedinUser: { _id: userId }
            })

            await updateUserPreferences(req, res)

            const sentData = res.json.mock.calls[0][0]
            expect(sentData.password).toBeUndefined()
        })
    })

    describe('getUsers - only returns logged-in users data', () => {
        it('should return 401 if not logged in', async () => {
            const { req, res } = createMockReqRes({
                loggedinUser: null
            })

            await getUsers(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.send).toHaveBeenCalledWith({ err: 'Login first!' })
        })

        it('should only return the logged-in users data', async () => {
            const userId = '123'
            const mockUser = {
                _id: userId,
                name: 'Test User',
                email: 'test@test.com',
                password: 'hashedPassword'
            }
            mockUserService.getById.mockResolvedValue(mockUser)

            const { req, res } = createMockReqRes({
                loggedinUser: { _id: userId }
            })

            await getUsers(req, res)

            expect(mockUserService.getById).toHaveBeenCalledWith(userId)
            expect(res.send).toHaveBeenCalled()
            const sentData = res.send.mock.calls[0][0]
            expect(Array.isArray(sentData)).toBe(true)
            expect(sentData.length).toBe(1)
            expect(sentData[0]._id).toBe(userId)
            expect(sentData[0].password).toBeUndefined()
        })
    })

    describe('addUser - disabled endpoint', () => {
        it('should return 403 and direct to signup', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'new@test.com', password: 'pass', name: 'New' }
            })

            await addUser(req, res)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.send).toHaveBeenCalledWith({ err: 'Use /api/auth/signup instead' })
        })
    })

    describe('Input validation', () => {
        describe('updateUserPreferences validation', () => {
            const userId = '123'

            it('should return 400 if preferences not provided', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: {},
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Preferences are required' })
            })

            it('should return 400 if fav-coins is not an array', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'fav-coins': 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'fav-coins must be an array' })
            })

            it('should return 400 if investor-type is not an array', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'investor-type': 'aggressive' } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'investor-type must be an array' })
            })

            it('should return 400 if investor-type has more than 1 selection', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'investor-type': ['a', 'b'] } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'investor-type must have exactly 1 selection' })
            })

            it('should return 400 if content-type is not an array', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'content-type': 'news' } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'content-type must be an array' })
            })

            it('should return 400 if content-type has less than 1 selection', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'content-type': [] } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'content-type must have exactly 1 selection' })
            })

            it('should return 400 if content-type has more than 1 selection', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { preferences: { 'content-type': ['a', 'b'] } },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'content-type must have exactly 1 selection' })
            })

            it('should accept valid preferences', async () => {
                const mockUser = {
                    _id: userId,
                    name: 'Test',
                    email: 'test@test.com',
                    preferences: {
                        'fav-coins': ['bitcoin'],
                        'investor-type': ['aggressive'],
                        'content-type': ['news']
                    },
                    hasCompletedOnboarding: false
                }
                mockUserService.updatePreferences.mockResolvedValue(mockUser)

                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: {
                        preferences: {
                            'fav-coins': ['bitcoin'],
                            'investor-type': ['aggressive'],
                            'content-type': ['news']
                        }
                    },
                    loggedinUser: { _id: userId }
                })

                await updateUserPreferences(req, res)

                expect(mockUserService.updatePreferences).toHaveBeenCalled()
                expect(res.json).toHaveBeenCalled()
            })
        })

        describe('addVote validation', () => {
            const userId = '123'

            it('should return 400 if vote is missing', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { type: 'coin', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Vote, type, and content are required' })
            })

            it('should return 400 if type is missing', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Vote, type, and content are required' })
            })

            it('should return 400 if content is missing', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', type: 'coin' },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Vote, type, and content are required' })
            })

            it('should return 400 if vote is not up or down', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'invalid', type: 'coin', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Vote must be "up" or "down"' })
            })

            it('should return 400 if type is not coin or news', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', type: 'invalid', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Type must be "coin" or "news"' })
            })

            it('should return 400 if coin content has no id', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', type: 'coin', content: { name: 'Bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'Coin content must have an id field' })
            })

            it('should return 400 if news content has no title or id', async () => {
                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', type: 'news', content: { source: 'CoinDesk' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(res.status).toHaveBeenCalledWith(400)
                expect(res.send).toHaveBeenCalledWith({ err: 'News content must have a title or id field' })
            })

            it('should accept valid coin vote', async () => {
                const mockUser = {
                    _id: userId,
                    name: 'Test',
                    email: 'test@test.com',
                    preferences: {},
                    hasCompletedOnboarding: true,
                    votes: [{ vote: 'up', type: 'coin', content: { id: 'bitcoin' } }]
                }
                mockUserService.addVote.mockResolvedValue(mockUser)

                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'up', type: 'coin', content: { id: 'bitcoin' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(mockUserService.addVote).toHaveBeenCalled()
                expect(res.json).toHaveBeenCalled()
            })

            it('should accept valid news vote with title', async () => {
                const mockUser = {
                    _id: userId,
                    name: 'Test',
                    email: 'test@test.com',
                    preferences: {},
                    hasCompletedOnboarding: true,
                    votes: [{ vote: 'down', type: 'news', content: { title: 'News Title' } }]
                }
                mockUserService.addVote.mockResolvedValue(mockUser)

                const { req, res } = createMockReqRes({
                    params: { userId },
                    body: { vote: 'down', type: 'news', content: { title: 'News Title' } },
                    loggedinUser: { _id: userId }
                })

                await addVote(req, res)

                expect(mockUserService.addVote).toHaveBeenCalled()
                expect(res.json).toHaveBeenCalled()
            })
        })
    })
})
