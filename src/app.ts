import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import { init as initRoutes } from './routes'

export const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// logs all requests in verbose mode
if (process.env.VERBOSE === 'true') {
  app.use(morgan('tiny', { immediate: true }))
}

initRoutes(app)
