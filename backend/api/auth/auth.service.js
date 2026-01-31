import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userService } from '../user/user.service.js'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup,
}

function getLoginToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    )
}

function validateToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}

async function login(email, password) {
    var user = await userService.getByEmail(email)
    if (!user) throw 'Unknown email'

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw 'Invalid email or password'

    //* Removing password and returning safe user data
    // Convert MongoDB ObjectId to string if needed
    const miniUser = {
        _id: user._id?.toString ? user._id.toString() : user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences || {
            'fav-coins': [],
            'investor-type': '',
            'content-type': []
        },
        hasCompletedOnboarding: user.hasCompletedOnboarding !== undefined ? user.hasCompletedOnboarding : false,
        votes: user.votes || []
    }
    return miniUser
}

async function signup({ email, password, name }) {
    const saltRounds = 10

    if (!email || !password || !name)
        throw 'Missing required signup information'

    const userExist = await userService.getByEmail(email)
    if (userExist) throw 'Email already taken'

    const hash = await bcrypt.hash(password, saltRounds)
    const savedUser = await userService.save({
        email,
        password: hash,
        name,
        preferences: {
            'fav-coins': [],
            'investor-type': '',
            'content-type': []
        },
        hasCompletedOnboarding: false,
        votes: []
    })

    // Return user without password
    // Convert MongoDB ObjectId to string if needed
    return {
        _id: savedUser._id?.toString ? savedUser._id.toString() : savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        preferences: savedUser.preferences,
        hasCompletedOnboarding: savedUser.hasCompletedOnboarding,
        votes: savedUser.votes || []
    }
}
