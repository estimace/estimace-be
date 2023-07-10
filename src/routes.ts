import { Express } from 'express'

import controllers from './controllers'

export function init(app: Express) {
  app.get('/rooms', controllers.rooms.getRoom)
  app.post('/rooms', controllers.rooms.create)
  app.post('/rooms/:id/players', controllers.players.create)
}
