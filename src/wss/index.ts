import WebSocket from 'ws'

import { parseJSON } from 'app/utils/json'
import { WSConnectionParam, isWSMessage } from './types'
import { updateEstimate } from 'app/controllers/players'
import { updateRoomState } from 'app/controllers/rooms'

export const wss = new WebSocket.Server({ noServer: true })

interface TypedWebSocket extends WebSocket {
  isAlive: boolean
}

//detect and close broken connections
const interval = setInterval(function ping() {
  wss.clients.forEach((ws: WebSocket) => {
    const TypedWebSocket = ws as TypedWebSocket
    if (TypedWebSocket.isAlive === false) {
      return ws.terminate()
    }
    TypedWebSocket.isAlive = false
    ws.ping()
  })
}, 3000)

wss.on('connection', (ws, param: WSConnectionParam) => {
  const TypedWebSocket = ws as TypedWebSocket
  TypedWebSocket.isAlive = true

  function sendMessage(type: string, payload: unknown) {
    ws.send(
      JSON.stringify({
        type,
        payload,
      }),
      { binary: false },
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
  ws.on('message', async (data, isBinary: any) => {
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

    switch (receivedMessage.type) {
      case 'updateEstimate':
        await updateEstimate(
          {
            connectionParam: param,
            payload: receivedMessage.payload,
          },
          {
            sendMessage,
            sendError,
          },
        )
        break

      case 'updateRoomState':
        await updateRoomState(
          {
            connectionParam: param,
            payload: receivedMessage.payload,
          },
          {
            sendMessage,
            sendError,
          },
        )
        break

      default:
        return sendError(
          'ws/message/type/unknown',
          'The value in the "type" field of the message is not supported',
        )
    }

    // wss.clients.forEach((client) => {
    //   //A client WebSocket broadcasting to every other connected WebSocket clients, excluding itself: client !== ws
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(
    //       JSON.stringify({
    //         type: receivedMessage.type,
    //         payload: { ...receivedMessage.payload, secretKey: '' },
    //       }),
    //       {
    //         binary: false,
    //       },
    //     )
    //   }
    // })
  })
})

wss.on('close', function close() {
  clearInterval(interval)
})
