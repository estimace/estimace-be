import { Server } from 'http'
import { URL } from 'url'

import { verifyAuthToken } from 'app/utils'
import { WSConnectionParam } from './types'
import { wss } from './index'

export function attachWSToServer(server: Server) {
  server.on('upgrade', (request, socket, head) => {
    if (!request.url) {
      return destroy(400, 'Bad request')
    }

    const { pathname, searchParams } = new URL(`http://localhost${request.url}`)

    if (pathname !== '/socket') {
      return destroy(404, 'Not Found')
    }

    const playerId = searchParams.get('playerId')
    const authToken = searchParams.get('authToken')

    if (!playerId || !authToken) {
      return destroy(401, 'Unauthorized')
    }

    if (!verifyAuthToken(playerId, authToken)) {
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
}
