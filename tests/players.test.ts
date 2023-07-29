import request from 'supertest'
import wsRequest from 'superwstest'

import { server } from 'app/server'
import config from 'app/config'
import { app } from 'app/webApp'
import {
  createTestRoom,
  createTestPlayer,
  mockTime,
  CreateTestPlayerParam,
  restoreTimeMock,
  CreateTestRoomParam,
} from './utils'
import { getPictureURLByEmail } from 'app/models/utils'
import { createAuthToken } from 'app/utils'
import { assertNotReceivedAnyMessage } from './utils/ws'

describe('Players', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    restoreTimeMock()
  })

  const testRoomId = '8b9be3d4-c522-4f1b-8bc2-b99f1fac4d44'
  const testPlayer = {
    email: 'darth@vader.com',
    name: 'Darth Vader',
  }

  describe('Create new player for specified room', () => {
    it('creates player by getting player name, player email, and a roomId', async () => {
      const mockedTime = mockTime()
      const createRoomParam: CreateTestRoomParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      }
      const { body: room, statusCode } = await createTestRoom(createRoomParam)
      expect(statusCode).toBe(201)

      const createPlayerParam: CreateTestPlayerParam = {
        name: 'Luke Skywalker',
        email: 'luke@skywalker.com',
        roomId: room.id,
      }
      const createdPlayerResponse = await createTestPlayer(createPlayerParam)
      expect(createdPlayerResponse.statusCode).toBe(201)
      const createdPlayer = createdPlayerResponse.body

      const roomResponse = await request(app)
        .get(`/rooms/${room.id}`)
        .set(
          'Authorization',
          `Bearer ${createdPlayer.id}:${createdPlayer.authToken}`,
        )

      expect(roomResponse).not.toBe(null)
      expect(roomResponse.body).toStrictEqual({
        id: room.id,
        state: 'planning',
        technique: 'fibonacci',
        players: expect.arrayContaining([
          expect.objectContaining({
            id: room.players[0].id,
            name: createRoomParam.name,
            pictureURL: getPictureURLByEmail(createRoomParam.email),
            estimate: null,
            isOwner: true,
            createdAt: mockedTime.toISOString(),
            updatedAt: null,
          }),
          expect.objectContaining({
            id: roomResponse.body.players[1].id,
            name: createPlayerParam.name,
            pictureURL: getPictureURLByEmail(createPlayerParam.email),
            estimate: null,
            isOwner: false,
            createdAt: mockedTime.toISOString(),
            updatedAt: null,
          }),
        ]),
        createdAt: mockedTime.toISOString(),
        updatedAt: null,
      })

      expect(roomResponse.body.players[0].email).not.toBeDefined()
      expect(roomResponse.body.players[1].email).not.toBeDefined()
    })

    it('broadcasts new player creation to other players in room', async () => {
      const mockedTime = mockTime()
      const sutRoomParam: CreateTestRoomParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      }
      const { body: sutRoom, statusCode } = await createTestRoom(sutRoomParam)
      expect(statusCode).toBe(201)

      const roomOwnerWs = wsRequest(server).ws(
        `/socket?playerId=${sutRoom.players[0].id}&authToken=${createAuthToken(
          sutRoom.players[0].id,
        )}`,
      )
      const { body: player, status } = await createTestPlayer({
        name: 'Luke Skywalker',
        email: 'luke@skywalker.com',
        roomId: sutRoom.id,
      })
      const playerWs = wsRequest(server).ws(
        `/socket?playerId=${player.id}&authToken=${createAuthToken(player.id)}`,
      )
      expect(status).toBe(201)

      assertNotReceivedAnyMessage(playerWs)

      await roomOwnerWs.expectJson({
        type: 'newPlayerJoined',
        payload: {
          id: player.id,
          roomId: player.roomId,
          name: player.name,
          pictureURL: player.pictureURL,
          isOwner: player.isOwner,
          createdAt: player.createdAt,
          estimate: player.estimate,
          updatedAt: player.updatedAt,
        },
      })

      await roomOwnerWs.close()
      await playerWs.close()
    })

    it('returns error if email address is invalid', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, email: 'john.com' })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/email/invalid',
        title: '"email" field is not a valid email address',
      })
    })
    it('returns error if email address is undefined', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, email: undefined })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/email/undefined',
        title: '"email" field is not defined',
      })
    })
    it('returns error if email address is empty', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, email: '  ' })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/email/empty',
        title: '"email" field is empty',
      })
    })
    it('returns error if email address is non-string', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, email: 123 })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/email/non-string',
        title: 'type of "email" field is not a string',
      })
    })

    it('returns error if player name is empty', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({
          ...testPlayer,
          name: '  ',
        })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/name/empty',
        title: '"name" field is empty',
      })
    })

    it('returns error if player name is undefined', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, name: undefined })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/name/undefined',
        title: '"name" field is not defined',
      })
    })
    it('returns error if player name is invalid', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/${testRoomId}/players`)
        .send({ ...testPlayer, name: 120 })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/name/non-string',
        title: 'type of "name" field is not a string',
      })
    })

    it('returns error if roomId is empty', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/    /players`)
        .send({ ...testPlayer })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/roomId/empty',
        title: '"roomId" field is empty',
      })
    })
    it('returns error if roomId is invalid', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/8b9be3d4/players`)
        .send({ ...testPlayer })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/roomId/invalid',
        title: '"roomId" field is not a valid UUID',
      })
    })
    it('returns error if roomId is not in db', async () => {
      const { body, statusCode } = await request(app)
        .post(`/rooms/d0870350-6ae7-4b58-bd09-aadd70d686b7/players`)
        .send({
          ...testPlayer,
        })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/players/create/roomId/not-found',
        title: 'room is not found',
      })
    })

    it('returns error if the number of players in room has reached the limit for number of players per room', async () => {
      const createRoomParam: CreateTestRoomParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      }
      const { body: room, statusCode } = await createTestRoom(createRoomParam)
      expect(statusCode).toBe(201)

      const createPlayerParam: CreateTestPlayerParam = {
        name: 'Luke Skywalker',
        email: 'luke@skywalker.com',
        roomId: room.id,
      }
      for (let i = 0; i < config.playersPerRoomLimit; i++) {
        const { body, statusCode } = await createTestPlayer(createPlayerParam)
        // room has already one player (the owner of the room)
        if (i === config.playersPerRoomLimit - 1) {
          expect(statusCode).toBe(400)
          expect(body).toStrictEqual({
            type: '/rooms/players/create/players-per-room-limit-reached',
            title:
              'The number of players in room has already reached the maximum limit of players per room',
          })
        } else {
          expect(statusCode).toBe(201)
        }
      }
    })
  })
})
