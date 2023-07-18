import { Player } from 'app/models/types'

export type WSConnectionParam = {
  playerId: string
}

export type WSMessage = {
  type: string
  payload: Record<string, unknown>
}

export function isWSMessage(message: {}): message is WSMessage {
  return (
    'type' in message &&
    typeof message.type === 'string' &&
    'payload' in message &&
    typeof message.payload === 'object' &&
    message.payload !== null &&
    !Array.isArray(message.payload)
  )
}

export type WSMessageHandler = (
  req: {
    connectionParam: WSConnectionParam
    payload: WSMessage['payload']
  },
  res: {
    sendMessage: (type: string, payload: unknown) => void
    sendError: (errorType: string, title: string) => void
    broadcastMessage: (
      type: string,
      payload: unknown,
      playersIds: Array<Player['id']>,
    ) => void
  },
) => Promise<void>
