import request from 'superwstest'
import { server } from 'app/server'
import { createAuthToken } from 'app/utils'

describe('websocket server authentication', () => {
  afterAll((done) => {
    server.close(done)
  })

  it('destroys the socket if the request path is not "/socket"', async () => {
    await request(server).ws('/foo/bar').expectConnectionError(404)
  })

  it('destroys the socket if the request is not authenticated', async () => {
    await request(server).ws('/socket').expectConnectionError(401)
  })

  it('destroys the socket if auth-scheme of authentication header is not "Bearer"', async () => {
    await request(server)
      .ws('/socket', {
        headers: { Authorization: `Basic sample-credentials` },
      })
      .expectConnectionError(401)
  })

  it('destroys the socket if the request auth info is invalid', async () => {
    const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
    const authToken = 'invalid-auth-token'
    await request(server)
      .ws('/socket', {
        headers: { Authorization: `Bearer ${playerId}:${authToken}` },
      })
      .expectConnectionError(401)
  })

  it('upgrades the connection if the request is authenticated', async () => {
    const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
    const authToken = createAuthToken(playerId)

    await request(server)
      .ws('/socket', {
        headers: { Authorization: `Bearer ${playerId}:${authToken}` },
      })
      .sendJson({ type: 'arbitrary-type', payload: { foo: 'bar' } })
      .close()
      .expectClosed()
  })
})
