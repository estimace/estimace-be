import request from 'superwstest'
import { server } from 'app/server'
import { createAuthToken } from 'app/utils'

import { deleteRoom, updateRoomState } from 'app/models/rooms'

import {
  CreateTestPlayerParam,
  createTestPlayer,
  createTestRoom,
  mockTime,
} from './utils'

describe('WebSocket Server', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll((done) => {
    server.close(done)
  })

  describe('general message validation', () => {
    it('does not expects messages in binary format', async () => {
      const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
      const authToken = createAuthToken(playerId)

      await request(server)
        .ws('/socket', {
          headers: { Authorization: `Bearer ${playerId}:${authToken}` },
        })
        .sendBinary([1, 2, 3])
        .expectJson({
          type: 'error',
          payload: {
            type: 'ws/message/not-json',
            title: 'Server does not support messages in binary',
          },
        })
        .close()
    })

    it('ignores any messages with invalid message.type value', async () => {
      const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
      const authToken = createAuthToken(playerId)

      await request(server)
        .ws('/socket', {
          headers: { Authorization: `Bearer ${playerId}:${authToken}` },
        })
        .sendJson({ type: 'arbitrary-type', payload: { foo: 'bar' } })
        .expectJson({
          type: 'error',
          payload: {
            type: 'ws/message/type/unknown',
            title:
              'The value in the "type" field of the message is not supported',
          },
        })
        .close()
    })

    it('ignores any message which is not a valid json', async () => {
      const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
      const authToken = createAuthToken(playerId)

      await request(server)
        .ws('/socket', {
          headers: { Authorization: `Bearer ${playerId}:${authToken}` },
        })
        .sendText({ name: 'name' })
        .expectJson({
          type: 'error',
          payload: {
            type: 'ws/message/json/invalid',
            title: 'Data is not a valid JSON',
          },
        })
        .close()
    })

    it('ignores any message which does not have properties "type" with string value and "payload" with a value of typeof of object', async () => {
      const playerId = '420e0ae8-ffb5-41ca-bbf1-1f75d578d731'
      const authToken = createAuthToken(playerId)

      await request(server)
        .ws('/socket', {
          headers: { Authorization: `Bearer ${playerId}:${authToken}` },
        })
        .sendJson({ name: 'name' })
        .expectJson({
          type: 'error',
          payload: {
            type: 'ws/message/invalid',
            title: 'Data is not a valid message',
          },
        })
        .close()
    })
  })

  describe('Player Estimation In Room', () => {
    async function createRoomAndTestPlayer() {
      const { body: room } = await createTestRoom()
      const createPlayerParam: CreateTestPlayerParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        roomId: room.id,
      }
      const { body: player } = await createTestPlayer(createPlayerParam)
      const authToken = createAuthToken(player.id)

      const ws = request(server).ws('/socket', {
        headers: { Authorization: `Bearer ${player.id}:${authToken}` },
      })

      return { ws, room, player }
    }

    it(`updates player's estimation if the ws message is a valid message with type "updateEstimate" and payload object has the "estimate" field`, async () => {
      const mockedTime = mockTime()
      const { ws, room, player } = await createRoomAndTestPlayer()

      await ws
        .sendJson({ type: 'updateEstimate', payload: { estimate: 4 } })
        .expectJson({
          type: 'estimateUpdated',
          payload: {
            id: player.id,
            roomId: room.id,
            email: 'darth@vader.com',
            name: 'Darth Vader',
            estimate: 4,
            isOwner: 0,
            createdAt: mockedTime,
            updatedAt: mockedTime,
          },
        })
        .close()
    })

    it.each([false, true, '', '  ', 'foo-bar'])(
      `returns error if estimate is not null or number (%s)`,
      async (param) => {
        const { ws } = await createRoomAndTestPlayer()

        await ws
          .sendJson({ type: 'updateEstimate', payload: { estimate: param } })
          .expectJson({
            type: 'error',
            payload: {
              type: '/rooms/player/estimate/update/estimate/not-number-or-null',
              title: 'type of "estimate" field is not a valid number or null',
            },
          })
          .close()
      },
    )

    it('returns error if estimate is not defined in the payload', async () => {
      const { ws } = await createRoomAndTestPlayer()

      await ws
        .sendJson({ type: 'updateEstimate', payload: {} })
        .expectJson({
          type: 'error',
          payload: {
            type: '/rooms/player/estimate/update/estimate/undefined',
            title: '"estimate" field is not defined',
          },
        })
        .close()
    })

    it('return error if player is not found', async () => {
      const playerId = '2232945b-0cee-4d3d-ad03-333b08f9e19b'
      const authToken = createAuthToken(playerId)
      await request(server)
        .ws('/socket', {
          headers: { Authorization: `Bearer ${playerId}:${authToken}` },
        })
        .sendJson({ type: 'updateEstimate', payload: { estimate: 3 } })
        .expectJson({
          type: 'error',
          payload: {
            type: '/rooms/player/estimate/update/player/not-found',
            title: 'could not found the player',
          },
        })
        .close()
    })

    it('return error if room is not found', async () => {
      const { ws, room } = await createRoomAndTestPlayer()
      await deleteRoom(room.id)

      await ws
        .sendJson({ type: 'updateEstimate', payload: { estimate: 3 } })
        .expectJson({
          type: 'error',
          payload: {
            type: '/rooms/player/estimate/update/room/not-found',
            title: 'could not found the room',
          },
        })
        .close()
    })

    it('returns error if room is not in "planning" state', async () => {
      const { ws, room } = await createRoomAndTestPlayer()
      await updateRoomState(room.id, 'revealed')

      await ws
        .sendJson({ type: 'updateEstimate', payload: { estimate: 2 } })
        .expectJson({
          type: 'error',
          payload: {
            type: '/rooms/player/estimate/update/room/not-planning',
            title:
              'can not update the estimate while room is not in "planning" state',
          },
        })
        .close()
    })

    it('returns error if estimate value is in the range of valid estimates for the room', async () => {
      const { ws } = await createRoomAndTestPlayer()

      await ws
        .sendJson({ type: 'updateEstimate', payload: { estimate: 1000 } })
        .expectJson({
          type: 'error',
          payload: {
            type: '/rooms/player/estimate/update/estimate/out-of-range',
            title:
              'estimate value is not in the range of valid estimates for the room',
          },
        })
        .close()
    })
  })
})
