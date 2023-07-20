import controllers from 'app/controllers'
import { WSMessageHandler } from './types'

export const routes: Record<string, WSMessageHandler> = {
  updateEstimate: controllers.players.updateEstimate,
  updateRoomState: controllers.rooms.updateState,
}
