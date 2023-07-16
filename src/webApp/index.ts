import express from 'express'
import morgan from 'morgan'

import config from 'app/config'
import { init as initRoutes } from 'app/webApp/routes'

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// logs all requests in verbose mode
if (config.verbose) {
  app.use(morgan('tiny', { immediate: true }))
}

initRoutes(app)
