import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
import { authRoutes } from './api/auth/auth.routes.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { loggerService } from './services/logger.service.js'

const app = express()

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
    app.use(cors(corsOptions))
}

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3333
app.listen(port, () => {
    loggerService.info(`Server ready at port ${port}`)
})

