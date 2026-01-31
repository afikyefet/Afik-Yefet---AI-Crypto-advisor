import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock authService
const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
    getLoginToken: jest.fn()
}

// Mock loggerService
const mockLoggerService = {
    error: jest.fn(),
    info: jest.fn()
}

jest.unstable_mockModule('../api/auth/auth.service.js', () => ({
    authService: mockAuthService
}))

jest.unstable_mockModule('../services/logger.service.js', () => ({
    loggerService: mockLoggerService
}))

// Import controller after mocking
const { login, signup, logout } = await import('../api/auth/auth.controller.js')

// Helper to create mock request/response
function createMockReqRes(overrides = {}) {
    const req = {
        body: {},
        cookies: {},
        ...overrides
    }
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis()
    }
    return { req, res }
}

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('login', () => {
        it('should login user and set httpOnly cookie', async () => {
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@test.com'
            }
            const mockToken = 'jwt-token-123'

            mockAuthService.login.mockResolvedValue(mockUser)
            mockAuthService.getLoginToken.mockReturnValue(mockToken)

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'password123' }
            })

            await login(req, res)

            expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'password123')
            expect(mockAuthService.getLoginToken).toHaveBeenCalledWith(mockUser)
            expect(res.cookie).toHaveBeenCalledWith('loginToken', mockToken, {
                sameSite: 'None',
                secure: true,
                httpOnly: true
            })
            expect(res.json).toHaveBeenCalledWith(mockUser)
        })

        it('should set httpOnly flag on cookie for security', async () => {
            mockAuthService.login.mockResolvedValue({ _id: '123' })
            mockAuthService.getLoginToken.mockReturnValue('token')

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass' }
            })

            await login(req, res)

            const cookieOptions = res.cookie.mock.calls[0][2]
            expect(cookieOptions.httpOnly).toBe(true)
            expect(cookieOptions.secure).toBe(true)
        })

        it('should return 401 on invalid credentials', async () => {
            mockAuthService.login.mockRejectedValue('Invalid email or password')

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'wrongpassword' }
            })

            await login(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.send).toHaveBeenCalledWith({ err: 'Invalid email or password' })
        })

        it('should return 401 on unknown email', async () => {
            mockAuthService.login.mockRejectedValue('Unknown email')

            const { req, res } = createMockReqRes({
                body: { email: 'unknown@test.com', password: 'pass' }
            })

            await login(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.send).toHaveBeenCalledWith({ err: 'Unknown email' })
        })

        it('should handle non-string errors gracefully', async () => {
            mockAuthService.login.mockRejectedValue(new Error('Database error'))

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass' }
            })

            await login(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.send).toHaveBeenCalledWith({ err: 'Failed to Login' })
        })
    })

    describe('signup', () => {
        it('should create user and set httpOnly cookie', async () => {
            const mockUser = {
                _id: 'new-id',
                name: 'New User',
                email: 'new@test.com',
                hasCompletedOnboarding: false
            }
            const mockToken = 'jwt-token-new'

            mockAuthService.signup.mockResolvedValue(mockUser)
            mockAuthService.getLoginToken.mockReturnValue(mockToken)

            const { req, res } = createMockReqRes({
                body: { email: 'new@test.com', password: 'password', name: 'New User' }
            })

            await signup(req, res)

            expect(mockAuthService.signup).toHaveBeenCalledWith({
                email: 'new@test.com',
                password: 'password',
                name: 'New User'
            })
            expect(res.cookie).toHaveBeenCalledWith('loginToken', mockToken, {
                sameSite: 'None',
                secure: true,
                httpOnly: true
            })
            expect(res.json).toHaveBeenCalledWith(mockUser)
        })

        it('should set httpOnly flag on cookie for security', async () => {
            mockAuthService.signup.mockResolvedValue({ _id: 'new' })
            mockAuthService.getLoginToken.mockReturnValue('token')

            const { req, res } = createMockReqRes({
                body: { email: 'new@test.com', password: 'pass', name: 'New' }
            })

            await signup(req, res)

            const cookieOptions = res.cookie.mock.calls[0][2]
            expect(cookieOptions.httpOnly).toBe(true)
            expect(cookieOptions.secure).toBe(true)
        })

        it('should return 400 if email already exists', async () => {
            mockAuthService.signup.mockRejectedValue('Email already taken')

            const { req, res } = createMockReqRes({
                body: { email: 'existing@test.com', password: 'pass', name: 'Test' }
            })

            await signup(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.send).toHaveBeenCalledWith({ err: 'Email already taken' })
        })

        it('should return 400 if required fields are missing', async () => {
            mockAuthService.signup.mockRejectedValue('Missing required signup information')

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com' } // missing password and name
            })

            await signup(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.send).toHaveBeenCalledWith({ err: 'Missing required signup information' })
        })

        it('should handle non-string errors gracefully', async () => {
            mockAuthService.signup.mockRejectedValue(new Error('Database error'))

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass', name: 'Test' }
            })

            await signup(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.send).toHaveBeenCalledWith({ err: 'Failed to signup' })
        })
    })

    describe('logout', () => {
        it('should clear the loginToken cookie', async () => {
            const { req, res } = createMockReqRes()

            await logout(req, res)

            expect(res.clearCookie).toHaveBeenCalledWith('loginToken')
            expect(res.send).toHaveBeenCalledWith({ msg: 'Logged out successfully' })
        })
    })
})

describe('Auth Security Features', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Cookie Security', () => {
        it('should use sameSite=None for cross-origin requests', async () => {
            mockAuthService.login.mockResolvedValue({ _id: '123' })
            mockAuthService.getLoginToken.mockReturnValue('token')

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass' }
            })

            await login(req, res)

            const cookieOptions = res.cookie.mock.calls[0][2]
            expect(cookieOptions.sameSite).toBe('None')
        })

        it('should use secure flag to only send over HTTPS', async () => {
            mockAuthService.signup.mockResolvedValue({ _id: 'new' })
            mockAuthService.getLoginToken.mockReturnValue('token')

            const { req, res } = createMockReqRes({
                body: { email: 'new@test.com', password: 'pass', name: 'New' }
            })

            await signup(req, res)

            const cookieOptions = res.cookie.mock.calls[0][2]
            expect(cookieOptions.secure).toBe(true)
        })
    })

    describe('Error Message Security', () => {
        it('should not expose internal error details on login failure', async () => {
            mockAuthService.login.mockRejectedValue(new Error('MongoDB connection failed'))

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass' }
            })

            await login(req, res)

            // Should return generic message, not the internal error
            expect(res.send).toHaveBeenCalledWith({ err: 'Failed to Login' })
        })

        it('should not expose internal error details on signup failure', async () => {
            mockAuthService.signup.mockRejectedValue(new Error('Database constraint violation'))

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'pass', name: 'Test' }
            })

            await signup(req, res)

            // Should return generic message, not the internal error
            expect(res.send).toHaveBeenCalledWith({ err: 'Failed to signup' })
        })

        it('should pass through user-friendly error messages', async () => {
            // String errors are considered user-friendly and safe to display
            mockAuthService.login.mockRejectedValue('Invalid email or password')

            const { req, res } = createMockReqRes({
                body: { email: 'test@test.com', password: 'wrong' }
            })

            await login(req, res)

            expect(res.send).toHaveBeenCalledWith({ err: 'Invalid email or password' })
        })
    })
})
