import { Server, createServer } from 'http'

import { wss } from 'app/wss'

export const startWSServer = async (): Promise<Server> => {
  const server = createServer()
  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request)
    })
  })

  return new Promise((resolve) => {
    server.listen(0, () => resolve(server))
  })
}

/**
 * this function takes a client WebSocket and forces the process to wait
 * until the client socket’s state becomes the desired value.
 */
export const waitForSocketState = (
  socket: WebSocket,
  state: number,
): Promise<void> => {
  return new Promise((resolve) => {
    function check() {
      if (socket.readyState === state) {
        resolve()
      } else {
        setTimeout(check, 10)
      }
    }
    check()
  })
}
