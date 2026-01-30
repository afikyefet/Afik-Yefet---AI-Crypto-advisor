export default {
    dbURL: process.env.DB_URL || process.env.MONGO_URL || '',
    dbName: process.env.DB_NAME || 'crypto_advisor'
}
