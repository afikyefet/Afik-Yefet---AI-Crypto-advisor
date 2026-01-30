import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'
const STORAGE_KEY_LOGGEDIN = 'loggedinUser'

// Configure axios to send credentials (cookies) with requests
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const userService = {
    getById,
    login,
    signup,
    logout,
    getEmptyCredentials,
    getLoggedinUser,
    updatePreferences,
    completeOnboarding,
}

async function getById(userId) {
    try {
        const response = await axiosInstance.get(`/api/user/${userId}`)
        return response.data
    } catch (err) {
        console.error('could not get user by id', err)
        throw err
    }
}

async function login({ email, password }) {
    try {
        const response = await axiosInstance.post('/api/auth/login', { email, password })
        const user = response.data
        _setLoggedinUser({
            ...user,
            preferences: user.preferences || { 'fav-coins': [], 'investor-type': '', 'content-type': [] },
            hasCompletedOnboarding: user.hasCompletedOnboarding !== undefined ? user.hasCompletedOnboarding : false
        })
        return user
    } catch (err) {
        const errorMsg = err.response?.data?.err || err.message || 'Invalid email or password'
        throw errorMsg
    }
}

async function signup({ email, password, name }) {
    try {
        const response = await axiosInstance.post('/api/auth/signup', { email, password, name })
        const user = response.data
        _setLoggedinUser({
            ...user,
            preferences: user.preferences || { 'fav-coins': [], 'investor-type': '', 'content-type': [] },
            hasCompletedOnboarding: user.hasCompletedOnboarding !== undefined ? user.hasCompletedOnboarding : false
        })
        return user
    } catch (err) {
        const errorMsg = err.response?.data?.err || err.message || 'Failed to signup'
        throw errorMsg
    }
}

async function logout() {
    try {
        await axiosInstance.post('/api/auth/logout')
        sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
        return Promise.resolve()
    } catch (err) {
        // Even if backend call fails, clear local storage
        sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
        return Promise.resolve()
    }
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function _setLoggedinUser(user) {
    const userToSave = {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        hasCompletedOnboarding: user.hasCompletedOnboarding
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
    return userToSave
}

function getEmptyCredentials() {
    return {
        email: '',
        password: '',
        name: ''
    }
}

async function updatePreferences(userId, preferences) {
    try {
        const response = await axiosInstance.put(`/api/user/${userId}/preferences`, { preferences })
        const user = response.data
        _setLoggedinUser(user)
        return user
    } catch (err) {
        const errorMsg = err.response?.data?.err || err.message || 'Failed to update preferences'
        throw errorMsg
    }
}

async function completeOnboarding(userId) {
    try {
        const response = await axiosInstance.put(`/api/user/${userId}/complete-onboarding`)
        const user = response.data
        _setLoggedinUser(user)
        return user
    } catch (err) {
        const errorMsg = err.response?.data?.err || err.message || 'Failed to complete onboarding'
        throw errorMsg
    }
}
