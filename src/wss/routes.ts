import controllers from 'app/controllers'
import { WSMessageHandler } from './types'

export function getRoutes(): Record<string, WSMessageHandler> {
  return {
    updateEstimate: controllers.players.updateEstimate,
    updateRoomState: controllers.rooms.updateState,
  }
}
