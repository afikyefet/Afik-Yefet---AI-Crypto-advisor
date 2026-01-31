import { loggerService } from "../../services/logger.service.js"
import { authService } from "./auth.service.js"


export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await authService.login(email, password)
        loggerService.info('User login: ', user)
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true, httpOnly: true })

        res.json(user)
    } catch (err) {
        loggerService.error('Failed to Login ' + err)
        const errorMsg = typeof err === 'string' ? err : 'Failed to Login'
        res.status(401).send({ err: errorMsg })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body

        const user = await authService.signup(credentials)
        loggerService.info('User signup:', user)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true, httpOnly: true })

        res.json(user)
    } catch (err) {
        loggerService.error('Failed to signup ' + err)
        const errorMsg = typeof err === 'string' ? err : 'Failed to signup'
        res.status(400).send({ err: errorMsg })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}
