import { RoomState } from 'app/models/types'

export type WSConnectionParam = {
  playerId: string
}

export type WSMessage = UpdateEstimateWSMessage | UpdateRoomStateWSMessage

export type UpdateEstimateWSMessage = {
  type: 'updateEstimate'
  payload: {
    estimate: number
  }
}

export type UpdateRoomStateWSMessage = {
  type: 'updateRoomState'
  payload: {
    state: RoomState
  }
}

export function isWSMessage(message: {}): message is WSMessage {
  return (
    'type' in message &&
    typeof message.type === 'string' &&
    'payload' in message &&
    typeof message.payload === 'object' &&
    !Array.isArray(message.payload)
  )
}

export type WSMessageHandler = (
  req: {
    connectionParam: WSConnectionParam
    payload: Record<string, unknown>
  },
  res: {
    sendMessage: (type: string, payload: unknown) => void
    sendError: (errorType: string, title: string) => void
  },
) => Promise<void>
