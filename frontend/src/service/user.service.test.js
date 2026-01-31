import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to create mock functions that get hoisted
const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockPut: vi.fn()
}))

// Mock axios using the hoisted mocks
vi.mock('axios', () => {
    return {
        default: {
            create: () => ({
                get: mockGet,
                post: mockPost,
                put: mockPut
            })
        }
    }
})

// Import after mocking
import { userService } from './user.service'

describe('User Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGet.mockReset()
        mockPost.mockReset()
        mockPut.mockReset()
        sessionStorage.getItem.mockReturnValue(null)
        sessionStorage.setItem.mockClear()
        sessionStorage.removeItem.mockClear()
    })

    describe('getEmptyCredentials', () => {
        it('should return empty credentials object', () => {
            const credentials = userService.getEmptyCredentials()

            expect(credentials).toEqual({
                email: '',
                password: '',
                name: ''
            })
        })
    })

    describe('getLoggedinUser', () => {
        it('should return null if no user in session storage', () => {
            sessionStorage.getItem.mockReturnValue(null)

            const result = userService.getLoggedinUser()

            expect(result).toBeNull()
        })

        it('should return parsed user from session storage', () => {
            const mockUser = { _id: '123', name: 'Test', email: 'test@test.com' }
            sessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser))

            const result = userService.getLoggedinUser()

            expect(result).toEqual(mockUser)
        })
    })

    describe('login', () => {
        it('should call API and store user in session', async () => {
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@test.com',
                preferences: { 'fav-coins': ['bitcoin'] },
                hasCompletedOnboarding: true,
                votes: []
            }
            mockPost.mockResolvedValue({ data: mockUser })

            const result = await userService.login({
                email: 'test@test.com',
                password: 'password123'
            })

            expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
                email: 'test@test.com',
                password: 'password123'
            })
            expect(result).toEqual(mockUser)
            expect(sessionStorage.setItem).toHaveBeenCalled()
        })

        it('should set default preferences if user has none', async () => {
            const mockUser = { _id: '123', name: 'Test', email: 'test@test.com' }
            mockPost.mockResolvedValue({ data: mockUser })

            await userService.login({ email: 'test@test.com', password: 'pass' })

            const savedUser = JSON.parse(sessionStorage.setItem.mock.calls[0][1])
            expect(savedUser.preferences).toEqual({
                'fav-coins': [],
                'investor-type': [],
                'content-type': []
            })
        })

        it('should throw error message on failure', async () => {
            mockPost.mockRejectedValue({
                response: { data: { err: 'Invalid credentials' } }
            })

            await expect(userService.login({ email: 'bad@test.com', password: 'wrong' }))
                .rejects.toBe('Invalid credentials')
        })
    })

    describe('signup', () => {
        it('should call API and store user in session', async () => {
            const mockUser = {
                _id: 'new-id',
                name: 'New User',
                email: 'new@test.com',
                hasCompletedOnboarding: false,
                votes: []
            }
            mockPost.mockResolvedValue({ data: mockUser })

            const result = await userService.signup({
                email: 'new@test.com',
                password: 'password',
                name: 'New User'
            })

            expect(mockPost).toHaveBeenCalledWith('/api/auth/signup', {
                email: 'new@test.com',
                password: 'password',
                name: 'New User'
            })
            expect(result).toEqual(mockUser)
        })

        it('should throw error on signup failure', async () => {
            mockPost.mockRejectedValue({
                response: { data: { err: 'Email already exists' } }
            })

            await expect(userService.signup({
                email: 'existing@test.com',
                password: 'pass',
                name: 'Test'
            })).rejects.toBe('Email already exists')
        })
    })

    describe('logout', () => {
        it('should call API and clear session storage', async () => {
            mockPost.mockResolvedValue({})

            await userService.logout()

            expect(mockPost).toHaveBeenCalledWith('/api/auth/logout')
            expect(sessionStorage.removeItem).toHaveBeenCalledWith('loggedinUser')
        })

        it('should clear session storage even if API call fails', async () => {
            mockPost.mockRejectedValue(new Error('Network error'))

            await userService.logout()

            expect(sessionStorage.removeItem).toHaveBeenCalledWith('loggedinUser')
        })
    })

    describe('getById', () => {
        it('should fetch user by id', async () => {
            const mockUser = { _id: '123', name: 'Test', email: 'test@test.com' }
            mockGet.mockResolvedValue({ data: mockUser })

            const result = await userService.getById('123')

            expect(mockGet).toHaveBeenCalledWith('/api/user/123')
            expect(result).toEqual(mockUser)
        })

        it('should throw error on failure', async () => {
            mockGet.mockRejectedValue(new Error('Not found'))

            await expect(userService.getById('invalid')).rejects.toThrow()
        })
    })

    describe('updatePreferences', () => {
        it('should update preferences and store updated user', async () => {
            const preferences = { 'fav-coins': ['bitcoin', 'ethereum'] }
            const updatedUser = { _id: '123', name: 'Test', preferences }
            mockPut.mockResolvedValue({ data: updatedUser })

            const result = await userService.updatePreferences('123', preferences)

            expect(mockPut).toHaveBeenCalledWith('/api/user/123/preferences', { preferences })
            expect(result).toEqual(updatedUser)
            expect(sessionStorage.setItem).toHaveBeenCalled()
        })
    })

    describe('completeOnboarding', () => {
        it('should mark onboarding as complete', async () => {
            const updatedUser = { _id: '123', hasCompletedOnboarding: true }
            mockPut.mockResolvedValue({ data: updatedUser })

            const result = await userService.completeOnboarding('123')

            expect(mockPut).toHaveBeenCalledWith('/api/user/123/complete-onboarding')
            expect(result.hasCompletedOnboarding).toBe(true)
        })
    })

    describe('addVote', () => {
        it('should add vote and store updated user', async () => {
            const updatedUser = {
                _id: '123',
                votes: [{ vote: 'up', type: 'coin', content: { id: 'bitcoin' } }]
            }
            mockPost.mockResolvedValue({ data: updatedUser })

            const result = await userService.addVote('123', 'up', 'coin', { id: 'bitcoin' })

            expect(mockPost).toHaveBeenCalledWith('/api/user/123/add-vote', {
                vote: 'up',
                type: 'coin',
                content: { id: 'bitcoin' }
            })
            expect(result.votes).toHaveLength(1)
        })
    })
})
