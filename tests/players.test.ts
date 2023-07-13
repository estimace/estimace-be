import request from 'supertest'
import { app } from 'app/app'
import {
  createTestRoom,
  createTestPlayer,
  mockTime,
  CreateTestPlayerParam,
} from './utils'
import { createAuthToken } from 'app/utils'

describe('Players', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const testRoomId = '8b9be3d4-c522-4f1b-8bc2-b99f1fac4d44'
  const testPlayer = {
    email: 'darth@vader.com',
    name: 'Darth Vader',
  }

  describe('Create new player for specified room', () => {
    it('creates player by getting player name, player email, and a roomId', async () => {
      const mockedTime = mockTime()
      const { body: room, statusCode } = await createTestRoom()
      expect(statusCode).toBe(201)

      const createPlayerParam: CreateTestPlayerParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        roomId: room.id,
      }
      const createdPlayerResponse = await createTestPlayer(createPlayerParam)
      expect(createdPlayerResponse.statusCode).toBe(201)

      const roomResponse = await request(app).get(`/rooms/${room.id}`)

      expect(roomResponse).not.toBe(null)
      expect(roomResponse.body).toStrictEqual({
        id: room.id,
        state: 1,
        technique: 'fibonacci',
        players: expect.arrayContaining([
          expect.objectContaining({
            id: room.players[0].id,
            email: 'darth@vader.com',
            name: 'Darth Vader',
            estimate: null,
            isOwner: true,
            createdAt: mockedTime,
            updatedAt: null,
          }),
          expect.objectContaining({
            id: roomResponse.body.players[1].id,
            email: 'darth@vader.com',
            name: 'Darth Vader',
            estimate: null,
            isOwner: false,
            createdAt: mockedTime,
            updatedAt: null,
          }),
        ]),
        createdAt: mockedTime,
        updatedAt: null,
      })
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
  })

  describe('Player Estimation In Room', () => {
    it("updates player's estimation in the specified room room", async () => {
      const mockedTime = mockTime()
      const { body: room } = await createTestRoom()
      const createPlayerParam: CreateTestPlayerParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        roomId: room.id,
      }
      const { body: player } = await createTestPlayer(createPlayerParam)

      const { body: updatedPlayer, statusCode } = await request(app)
        .put(`/rooms/${player.roomId}/player/estimate`)
        .send({
          playerId: player.id,
          estimate: 2,
          secretKey: player.secretKey,
        })

      expect(updatedPlayer).toStrictEqual({
        id: player.id,
        roomId: player.roomId,
        email: 'darth@vader.com',
        name: 'Darth Vader',
        estimate: 2,
        isOwner: 0,
        createdAt: mockedTime,
        updatedAt: mockedTime,
      })
      expect(statusCode).toBe(200)
    })

    it('returns error if roomId is not a valid UUID', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/xyzxyz45/player/estimate`)
        .send({
          playerId: '7a124d0e-b2b5-4711-bce3-12b9e5a81f82',
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: '/rooms/player/estimate/roomId/invalid',
        title: '"roomId" field is not a valid UUID',
      })
    })

    it('returns error if roomId is not in rooms database', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/d0870350-6ae7-4b58-bd09-aadd70d686b7/player/estimate`)
        .send({
          playerId: 'f3b6d6a9-a7bc-4e62-bce2-b064712ef6db',
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/player/estimate/update/not-found',
        title: 'room is not found',
      })
    })

    it('returns error if roomId is empty', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/    /player/estimate`)
        .send({
          playerId: '7a124d0e-b2b5-4711-bce3-12b9e5a81f82',
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/roomId/empty`,
        title: `"roomId" field is empty`,
      })
    })

    it('returns error if playerId is not a valid UUID', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: '7a124-12b9e5a81f82',
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: '/rooms/player/estimate/playerId/invalid',
        title: '"playerId" field is not a valid UUID',
      })
    })

    it('returns error if playerId is not in players database', async () => {
      //roomId should be in db and player's secretKey should be verified to be able to test playerId's existence in db
      const { body: room } = await createTestRoom()
      const secretKey = createAuthToken('8f7c47e8-54b0-4c35-8fc7-d13eb6404650')
      const { body, statusCode } = await request(app)
        .put(`/rooms/${room.id}/player/estimate`)
        .send({
          playerId: '8f7c47e8-54b0-4c35-8fc7-d13eb6404650',
          estimate: 2,
          secretKey,
        })

      expect(body).toStrictEqual({
        type: '/rooms/player/estimate/update/no-found',
        title: 'could not found the player in specified room',
      })
      expect(statusCode).toBe(400)
    })

    it('returns error if playerId is undefined', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: undefined,
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/playerId/undefined`,
        title: `"playerId" field is not defined`,
      })
    })

    it('returns error if playerId is empty', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: '  ',
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/playerId/empty`,
        title: `"playerId" field is empty`,
      })
    })

    it('returns error if playerId is not string', async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: 73171,
          estimate: 2,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/playerId/non-string`,
        title: `type of "playerId" field is not a string`,
      })
    })

    it("returns error if player's estimate is not number", async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: 'abac523b-aa5c-4cfe-842d-2b8c28fcd9e5',
          estimate: ' 34 ',
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/estimate/not-number`,
        title: `type of "estimate" field is not a valid number`,
      })
    })
    it("returns error if player's estimate is undefined", async () => {
      const { body, statusCode } = await request(app)
        .put(`/rooms/33b4f55d-b8d2-49fa-ab2a-73171624f154/player/estimate`)
        .send({
          playerId: 'abac523b-aa5c-4cfe-842d-2b8c28fcd9e5',
          estimate: undefined,
          secretKey: '7a124d0e-b2b5-4711',
        })

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: `/rooms/player/estimate/estimate/undefined`,
        title: `"estimate" field is not defined`,
      })
    })
  })
})
