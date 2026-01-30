import { userService } from "../../service/user.service"
import { SET_ISSIGNUP, SET_USER, TOGGLE_ISSIGNUP } from "../reducers/user.reducer"
import { store } from "../store"

export function login(credentials = {}) {
    const { email, password } = credentials
    return userService.login({ email, password })
        .then((user) => {
            store.dispatch({ type: SET_USER, user })
            return user
        })
        .catch((err) => {
            console.log('user actions -> Cannot login', err)
            throw err
        })
}

export function signup(credentials = {}) {
    const { email, name, password } = credentials
    return userService.signup({ email, name, password })
        .then((user) => {
            store.dispatch({ type: SET_USER, user })
            return user
        })
        .catch((err) => {
            console.log('user actions -> Cannot signup', err)
            throw err
        })
}

export function logout() {
    return userService.logout()
        .then(() => {
            store.dispatch({ type: SET_USER, user: null })
        })
        .catch((err) => {
            console.log('user actions -> Cannot logout', err)
        })
}

export function setIsSignup(isSignup) {
    store.dispatch({ type: SET_ISSIGNUP, isSignup })
}

export function toggleIsSignup() {
    store.dispatch({ type: TOGGLE_ISSIGNUP })
}
