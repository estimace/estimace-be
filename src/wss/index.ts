import WebSocket from 'ws'

import { parseJSON } from 'app/utils/json'
import { Player } from 'app/models/types'
import { getRoutes } from './routes'
import { WSConnectionParam, isWSMessage } from './types'

export const wss = new WebSocket.Server({ noServer: true })

interface TypedWebSocket extends WebSocket {
  isAlive: boolean
  connectionParam: WSConnectionParam
}
type WSClients = Record<Player['id'], TypedWebSocket>
export const clients: WSClients = {}

export function broadcastMessage(
  type: string,
  payload: unknown,
  playersIds: Array<Player['id']>,
) {
  for (const playerId of playersIds) {
    const client = clients[playerId]
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type,
          payload,
        }),
        { binary: false },
      )
    }
  }
}

export async function destroyConnection(playersIds: Array<Player['id']>) {
  for (const playerId of playersIds) {
    const client = clients[playerId]
    if (client && client.readyState === WebSocket.OPEN) {
      client.close()
    }
  }
}

// detect and close broken connections
const interval = setInterval(function ping() {
  wss.clients.forEach((ws: WebSocket) => {
    const TypedWebSocket = ws as TypedWebSocket
    if (TypedWebSocket.isAlive === false) {
      delete clients[TypedWebSocket.connectionParam.playerId]
      return TypedWebSocket.terminate()
    }
    TypedWebSocket.isAlive = false
    ws.ping()
  })
}, 3000)

wss.on('connection', (ws, param: WSConnectionParam) => {
  if (clients[param.playerId]) {
    clients[param.playerId].terminate()
  }

  const routes = getRoutes()

  const TypedWebSocket = ws as TypedWebSocket
  TypedWebSocket.isAlive = true
  TypedWebSocket.connectionParam = param
  clients[param.playerId] = TypedWebSocket

  function sendMessage(type: string, payload: unknown) {
    ws.send(
      JSON.stringify({
        type,
        payload,
      }),
      { binary: false },
    )
  }

  function _broadcastMessage(
    type: string,
    payload: unknown,
    playersIds: Array<Player['id']>,
  ) {
    broadcastMessage(
      type,
      payload,
      playersIds.filter((playerId) => clients[playerId] !== ws),
    )
  }

  function sendError(errorType: string, title: string) {
    return sendMessage('error', {
      type: errorType,
      title,
    })
  }

  ws.on('error', console.error)
  ws.on('pong', () => (TypedWebSocket.isAlive = true))
  ws.on('message', (data, isBinary: any) => {
    if (isBinary) {
      return sendError(
        'ws/message/not-json',
        'Server does not support messages in binary',
      )
    }

    const receivedMessage = parseJSON(data.toString())
    if (!receivedMessage) {
      return sendError('ws/message/json/invalid', 'Data is not a valid JSON')
    }

    if (!isWSMessage(receivedMessage)) {
      return sendError('ws/message/invalid', 'Data is not a valid message')
    }

    const handler = routes[receivedMessage.type]
    if (!handler) {
      return sendError(
        'ws/message/type/unknown',
        'The value in the "type" field of the message is not supported',
      )
    }
    handler(
      {
        connectionParam: param,
        payload: receivedMessage.payload,
      },
      {
        sendMessage,
        broadcastMessage: _broadcastMessage,
        sendError,
      },
    ).catch((err) => {
      console.error(
        'Unexpected error while processing a message from ws client.',
      )
      console.error(err)
      return sendError(
        'ws/message/unexpected',
        'An unexpected error occurred on the server',
      )
    })
  })
})

wss.on('close', function close() {
  clearInterval(interval)
})
