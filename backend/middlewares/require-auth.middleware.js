import { authService } from "../api/auth/auth.service.js";

export function requireAuth(req, res, next) {
    // console.log('req.cookies', req, req?.cookies);
    const authHeader = req.headers.authorization || ''
    const bearerToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null
    const cookieToken = req.cookies?.loginToken
    const token = bearerToken || cookieToken
    const loggedinUser = authService.validateToken(token)

    if (!loggedinUser) return res.status(401).send('Login first!')
    req.loggedinUser = loggedinUser
    next()
} 
