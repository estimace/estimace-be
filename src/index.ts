// import http from "http"
import express from 'express'
import WebSocket from 'ws'
import { createServer } from 'http'

import dotenv from 'dotenv'

dotenv.config()
export const app = express()
const port = process.env.PORT
const server = createServer(app)

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server + ws!!!???')
})

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server })

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
}, 60000)

wss.on('connection', (ws) => {
  const TypedWebSocket = ws as TypedWebSocket
  TypedWebSocket.isAlive = true
  ws.on('error', console.error)
  ws.on('pong', () => (TypedWebSocket.isAlive = true))

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      return
    }

    console.log(`Received message`, data)
    try {
      const receivedMessage = JSON.parse(data.toString())
      console.log('estimate', receivedMessage.text)
      wss.clients.forEach((client) => {
        //A client WebSocket broadcasting to every other connected WebSocket clients, excluding itself: client !== ws
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(receivedMessage), { binary: false })
        }
      })
    } catch (error) {
      console.log(error)
      throw new Error(`error: ${data} is not a right message`)
    }
  })
})

wss.on('close', function close() {
  clearInterval(interval)
})
