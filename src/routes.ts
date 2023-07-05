import { Express } from 'express'

import controllers from './controllers'

export function init(app: Express) {
  app.post('/rooms', controllers.rooms.create)
  app.post('/rooms/:id/players', controllers.rooms.create)
}
