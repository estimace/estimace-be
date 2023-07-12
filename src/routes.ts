import { Express } from 'express'

import controllers from './controllers'

export function init(app: Express) {
  app.get('/rooms/:id', controllers.rooms.get)
  app.post('/rooms', controllers.rooms.create)
  app.post('/rooms/:id/players', controllers.players.create)
  app.put('/rooms/:roomId/player/estimate', controllers.players.updatePlayer)
}
