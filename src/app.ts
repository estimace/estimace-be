import express from 'express'
import bodyParser from 'body-parser'

import { init as initRoutes } from './routes'

export const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
initRoutes(app)
