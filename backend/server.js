import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
import { aiRoutes } from './api/ai/ai.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { marketRoutes } from './api/market/market.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// CORS configuration - must be before other middleware
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'https://afik-yefet-ai-crypto-advisor.onrender.com',
            'https://afik-yefet-ai-crypto-advisor.vercel.app',
            '*'
        ]
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}

// Apply CORS to all routes
app.use(cors(corsOptions))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
}

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/ai', aiRoutes)


app.get('/*', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3333
app.listen(port, () => {
    loggerService.info(`Server ready at port ${port}`)
})

