import { storageService } from "./async-storage.service"

const STORAGE_KEY = "userDB"
const STORAGE_KEY_LOGGEDIN = 'loggedinUser'


export const userService = {
    getById,
    login,
    signup,
    logout,
    getEmptyCredentials,
    getLoggedinUser,
}

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
        .then(user => {
            delete user.password
            return user
        })
        .catch(err => {
            console.error('could not get user by id', err)
            throw err
        })
}

function login({ email, password }) {
    return storageService.query(STORAGE_KEY)
        .then(users => {
            const user = users.find(user => user.email === email)
            if (user && user.password !== password) return Promise.reject('Incorrect Password')
            if (user) return _setLoggedinUser(user)
            else return Promise.reject('Invalid login')
        })
}

function signup({ email, password, name }) {
    const user = { email, password, name }
    return storageService.post(STORAGE_KEY, user)
        .then(_setLoggedinUser)
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
    return Promise.resolve()
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function _setLoggedinUser(user) {
    const userToSave = { _id: user._id, name: user.name, email: user.email }
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
