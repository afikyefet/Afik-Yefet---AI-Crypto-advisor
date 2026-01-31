import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the userService before importing the reducer
vi.mock('../../service/user.service', () => ({
    userService: {
        getLoggedinUser: vi.fn(() => null)
    }
}))

import {
    userReducer,
    SET_USER,
    SET_ISSIGNUP,
    TOGGLE_ISSIGNUP
} from './user.reducer'

describe('User Reducer', () => {
    const initialState = {
        user: null,
        isSignup: false
    }

    describe('SET_USER', () => {
        it('should set user in state', () => {
            const user = { _id: '123', name: 'Test User', email: 'test@test.com' }
            const action = { type: SET_USER, user }

            const result = userReducer(initialState, action)

            expect(result.user).toEqual(user)
            expect(result.isSignup).toBe(false)
        })

        it('should not mutate original state', () => {
            const user = { _id: '123', name: 'Test' }
            const action = { type: SET_USER, user }

            const result = userReducer(initialState, action)

            expect(result).not.toBe(initialState)
            expect(initialState.user).toBeNull()
        })

        it('should handle null user (logout)', () => {
            const stateWithUser = { user: { _id: '123' }, isSignup: false }
            const action = { type: SET_USER, user: null }

            const result = userReducer(stateWithUser, action)

            expect(result.user).toBeNull()
        })
    })

    describe('SET_ISSIGNUP', () => {
        it('should set isSignup to true', () => {
            const action = { type: SET_ISSIGNUP, isSignup: true }

            const result = userReducer(initialState, action)

            expect(result.isSignup).toBe(true)
            expect(result.user).toBeNull()
        })

        it('should set isSignup to false', () => {
            const stateWithSignup = { user: null, isSignup: true }
            const action = { type: SET_ISSIGNUP, isSignup: false }

            const result = userReducer(stateWithSignup, action)

            expect(result.isSignup).toBe(false)
        })
    })

    describe('TOGGLE_ISSIGNUP', () => {
        it('should toggle isSignup from false to true', () => {
            const action = { type: TOGGLE_ISSIGNUP }

            const result = userReducer(initialState, action)

            expect(result.isSignup).toBe(true)
        })

        it('should toggle isSignup from true to false', () => {
            const stateWithSignup = { user: null, isSignup: true }
            const action = { type: TOGGLE_ISSIGNUP }

            const result = userReducer(stateWithSignup, action)

            expect(result.isSignup).toBe(false)
        })
    })

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION' }

            const result = userReducer(initialState, action)

            expect(result).toEqual(initialState)
        })

        it('should return initial state when state is undefined', () => {
            const action = { type: 'UNKNOWN_ACTION' }

            const result = userReducer(undefined, action)

            expect(result).toHaveProperty('user')
            expect(result).toHaveProperty('isSignup')
        })

        it('should handle empty action object', () => {
            const result = userReducer(initialState, {})

            expect(result).toEqual(initialState)
        })
    })
})
