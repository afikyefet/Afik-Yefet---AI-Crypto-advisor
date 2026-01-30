import bcrypt from 'bcrypt'
import Cryptr from 'cryptr'
import { userService } from '../user/user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-123')

export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup,
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    let encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
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
    })

    // Return user without password
    // Convert MongoDB ObjectId to string if needed
    return {
        _id: savedUser._id?.toString ? savedUser._id.toString() : savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
    }
}
