import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_EXPIRES_IN = '7d'

// Mock userService
const mockUserService = {
    getByEmail: jest.fn(),
    save: jest.fn()
}

// Mock the userService module
jest.unstable_mockModule('../api/user/user.service.js', () => ({
    userService: mockUserService
}))

// Import authService after mocking
const { authService } = await import('../api/auth/auth.service.js')

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getLoginToken', () => {
        it('should generate a valid JWT token with user data', () => {
            const user = {
                _id: '123',
                name: 'Test User',
                email: 'test@example.com'
            }

            const token = authService.getLoginToken(user)

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')

            // Verify token contents
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            expect(decoded._id).toBe('123')
            expect(decoded.name).toBe('Test User')
            expect(decoded.email).toBe('test@example.com')
        })

        it('should include expiration in token', () => {
            const user = { _id: '123', name: 'Test', email: 'test@test.com' }
            const token = authService.getLoginToken(user)
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            expect(decoded.exp).toBeDefined()
        })
    })

    describe('validateToken', () => {
        it('should return decoded payload for valid token', () => {
            const user = { _id: '123', name: 'Test', email: 'test@test.com' }
            const token = authService.getLoginToken(user)

            const result = authService.validateToken(token)

            expect(result._id).toBe('123')
            expect(result.name).toBe('Test')
            expect(result.email).toBe('test@test.com')
        })

        it('should return null for invalid token', () => {
            const result = authService.validateToken('invalid-token')
            expect(result).toBeNull()
        })

        it('should return null for expired token', () => {
            const expiredToken = jwt.sign(
                { _id: '123' },
                process.env.JWT_SECRET,
                { expiresIn: '-1s' }
            )

            const result = authService.validateToken(expiredToken)
            expect(result).toBeNull()
        })
    })

    describe('login', () => {
        it('should return user data on successful login', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10)
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                preferences: { 'fav-coins': ['bitcoin'] },
                hasCompletedOnboarding: true,
                votes: []
            }

            mockUserService.getByEmail.mockResolvedValue(mockUser)

            const result = await authService.login('test@example.com', 'password123')

            expect(result._id).toBe('123')
            expect(result.name).toBe('Test User')
            expect(result.email).toBe('test@example.com')
            expect(result.preferences).toEqual({ 'fav-coins': ['bitcoin'] })
            expect(result.password).toBeUndefined()
        })

        it('should throw error for unknown email', async () => {
            mockUserService.getByEmail.mockResolvedValue(null)

            await expect(authService.login('unknown@example.com', 'password'))
                .rejects.toBe('Unknown email')
        })

        it('should throw error for invalid password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10)
            mockUserService.getByEmail.mockResolvedValue({
                _id: '123',
                email: 'test@example.com',
                password: hashedPassword
            })

            await expect(authService.login('test@example.com', 'wrongpassword'))
                .rejects.toBe('Invalid email or password')
        })

        it('should return default preferences if user has none', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10)
            mockUserService.getByEmail.mockResolvedValue({
                _id: '123',
                name: 'Test',
                email: 'test@example.com',
                password: hashedPassword
            })

            const result = await authService.login('test@example.com', 'password123')

            expect(result.preferences).toEqual({
                'fav-coins': [],
                'investor-type': [],
                'content-type': []
            })
        })
    })

    describe('signup', () => {
        it('should create new user and return user data', async () => {
            mockUserService.getByEmail.mockResolvedValue(null)
            mockUserService.save.mockImplementation(async (user) => ({
                ...user,
                _id: 'new-user-id'
            }))

            const result = await authService.signup({
                email: 'new@example.com',
                password: 'password123',
                name: 'New User'
            })

            expect(result._id).toBe('new-user-id')
            expect(result.name).toBe('New User')
            expect(result.email).toBe('new@example.com')
            expect(result.password).toBeUndefined()
            expect(result.hasCompletedOnboarding).toBe(false)
        })

        it('should throw error if email already exists', async () => {
            mockUserService.getByEmail.mockResolvedValue({ _id: '123' })

            await expect(authService.signup({
                email: 'existing@example.com',
                password: 'password123',
                name: 'Test'
            })).rejects.toBe('Email already taken')
        })

        it('should throw error if required fields are missing', async () => {
            await expect(authService.signup({ email: 'test@test.com' }))
                .rejects.toBe('Missing required signup information')

            await expect(authService.signup({ email: '', password: 'pass', name: 'Test' }))
                .rejects.toBe('Missing required signup information')
        })

        it('should hash password before saving', async () => {
            mockUserService.getByEmail.mockResolvedValue(null)
            mockUserService.save.mockImplementation(async (user) => ({
                ...user,
                _id: 'new-id'
            }))

            await authService.signup({
                email: 'test@example.com',
                password: 'plainpassword',
                name: 'Test'
            })

            const savedUser = mockUserService.save.mock.calls[0][0]
            expect(savedUser.password).not.toBe('plainpassword')

            // Verify it's a valid bcrypt hash
            const isValidHash = await bcrypt.compare('plainpassword', savedUser.password)
            expect(isValidHash).toBe(true)
        })
    })
})
