import configDev from './dev.js'
import configProd from './prod.js'

export var config

if (process.env.NODE_ENV === 'production') {
  config = configProd
} else {
  config = configDev
}

// Validate required environment variables
if (!config.dbURL) {
  throw new Error('DB_URL environment variable is required')
}

if (!config.dbName) {
  throw new Error('DB_NAME environment variable is required')
}
