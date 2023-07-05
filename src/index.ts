// import http from "http"
import express from 'express'
import WebSocket from 'ws'
import { createServer } from 'http'
import dotenv from 'dotenv'

import { init as initRoutes } from './routes'

dotenv.config()
export const app = express()
const port = process.env.PORT
const server = createServer(app)

initRoutes(app)

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
}, 3000)

wss.on('connection', (ws) => {
  const TypedWebSocket = ws as TypedWebSocket
  TypedWebSocket.isAlive = true
  ws.on('error', console.error)
  ws.on('pong', () => (TypedWebSocket.isAlive = true))

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      return
    }
    try {
      const receivedMessage = JSON.parse(data.toString())
      console.log('received client data  ', receivedMessage)
      wss.clients.forEach((client) => {
        //A client WebSocket broadcasting to every other connected WebSocket clients, excluding itself: client !== ws
        if (client !== ws && client.readyState === WebSocket.OPEN) {
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

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
