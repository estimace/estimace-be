import { AddressInfo } from 'net'
import { createServer } from 'http'
import { URL } from 'url'

import config from './config'
import { app } from './app'
import { wss } from './wss'
import type { WSConnectionParam } from './wss/types'
import { verifyAuthToken } from './utils'

export const server = createServer(app)

server.on('upgrade', function upgrade(request, socket, head) {
  if (!request.url) {
    return destroy(400, 'Bad request')
  }

  const { pathname } = new URL(`http://localhost${request.url}`)

  if (pathname !== '/socket') {
    return destroy(404, 'Not Found')
  }

  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return destroy(401, 'Unauthorized')
  }

  const [playerId, secretToken] = authHeader.substring(7).split(':')
  if (!verifyAuthToken(playerId, secretToken)) {
    return destroy(401, 'Authentication failed')
  }

  wss.handleUpgrade(request, socket, head, function done(ws) {
    const param: WSConnectionParam = {
      playerId,
    }
    wss.emit('connection', ws, param)
  })

  function destroy(errorCode: number, errorMessage: string) {
    socket.write(
      `HTTP/1.1 ${errorCode} ${errorMessage}\r\n\r\n`,
      'utf-8',
      () => {
        socket.destroy()
      },
    )
  }
})

server.listen(config.port, () => {
  const address = server.address() as AddressInfo
  console.log(`[server]: Server is running at http://localhost:${address.port}`)
})
