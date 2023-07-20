import request from 'supertest'
import { app } from 'app/webApp'
import {
  createTestRoom,
  uuidRegex,
  mockTime,
  restoreTimeMock,
  CreateTestRoomParam,
} from './utils'
import { createAuthToken } from 'app/utils'
import { getPictureURLByEmail } from 'app/models/utils'

describe('Rooms', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    restoreTimeMock()
  })

  describe('Create Room', () => {
    it('creates room by getting owner name, owner email, and estimation technique', async () => {
      const mockedTime = mockTime()
      const createParam: CreateTestRoomParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      }
      const { body, statusCode } = await createTestRoom(createParam)
      expect(body).toStrictEqual(
        expect.objectContaining({
          state: 'planning',
          technique: 'fibonacci',
          players: expect.arrayContaining([
            expect.objectContaining({
              name: 'Darth Vader',
              pictureURL: getPictureURLByEmail(createParam.email),
              estimate: null,
              isOwner: true,
              authToken: createAuthToken(body.players[0].id),
              createdAt: mockedTime.toISOString(),
              updatedAt: null,
            }),
          ]),
          createdAt: mockedTime.toISOString(),
          updatedAt: null,
        }),
      )
      expect(body.id).toMatch(uuidRegex)
      expect(body.players[0].id).toMatch(uuidRegex)
      expect(body.players[0].roomId).toBe(body.id)
      expect(body.players[0].email).not.toBeDefined()
      expect(statusCode).toBe(201)
    })

    it('returns error if email address is invalid', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'johnsmith.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/email/invalid',
        title: '"email" field is not a valid email address',
      })
    })
    it('returns error if email address is undefined', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: undefined,
        name: 'Darth Vader',
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/email/undefined',
        title: '"email" field is not defined',
      })
    })
    it('returns error if email address is empty', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: '  ',
        name: 'Darth Vader',
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/email/empty',
        title: '"email" field is empty',
      })
    })
    it('returns error if email address is non-string', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 123,
        name: 'Darth Vader',
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/email/non-string',
        title: 'type of "email" field is not a string',
      })
    })

    it('returns error if email address is more than 255 characters', async () => {
      const { body, statusCode } = await request(app)
        .post('/rooms')
        .send({
          email: new Array(256).fill('x').join(''),
          name: 'Darth Vader',
          technique: 'fibonacci',
        })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/email/too-long',
        title: 'length of "email" field can not be greater than 255',
      })
    })

    it('returns error if player name is empty', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: '  ',
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/name/empty',
        title: '"name" field is empty',
      })
    })

    it('returns error if player name is undefined', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: undefined,
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/name/undefined',
        title: '"name" field is not defined',
      })
    })
    it('returns error if player name is invalid', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: 120,
        technique: 'fibonacci',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/name/non-string',
        title: 'type of "name" field is not a string',
      })
    })

    it('returns error if player name is more than 255 characters', async () => {
      const { body, statusCode } = await request(app)
        .post('/rooms')
        .send({
          email: 'darth@vader.com',
          name: new Array(256).fill('x').join(''),
          technique: 'fibonacci',
        })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/name/too-long',
        title: 'length of "name" field can not be greater than 255',
      })
    })

    it('returns error if estimation technique is undefined', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: undefined,
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/technique/undefined',
        title: '"technique" field is not defined',
      })
    })
    it('returns error if estimation technique is empty', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: '  ',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/technique/empty',
        title: '"technique" field is empty',
      })
    })
    it('returns error if estimation technique is invalid', async () => {
      const { body, statusCode } = await request(app).post('/rooms').send({
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'estimation-technique',
      })

      expect(statusCode).toBe(400)
      expect(body).toStrictEqual({
        type: '/rooms/create/technique/invalid',
        title: '"technique" field is not a valid estimation technique',
      })
    })
  })

  describe('Get Room', () => {
    it('returns 404 error if roomId is not a valid UUID', async () => {
      const { body, statusCode } = await request(app).get(`/rooms/xyzxyz45`)

      expect(statusCode).toBe(404)
      expect(body).toStrictEqual({
        type: '/rooms/get/id/invalid',
        title: '"id" field is not a valid UUID',
      })
    })

    it('returns error if auth headers is not present in the request header', async () => {
      const createdRoomRes = await createTestRoom()
      const roomId = createdRoomRes.body.id
      const { body, statusCode } = await request(app).get(`/rooms/${roomId}`)
      expect(body).toStrictEqual({
        type: '/rooms/get/authorization/not-provided',
        title: '"authorization" headers are not provided',
      })
      expect(statusCode).toBe(401)
    })

    it('returns error if auth-scheme of authentication header is not "Bearer"', async () => {
      const createdRoomRes = await createTestRoom()
      const roomId = createdRoomRes.body.id
      const { body, statusCode } = await await request(app)
        .get(`/rooms/${roomId}`)
        .set('Authorization', 'Basic sample-credentials')
      expect(body).toStrictEqual({
        type: '/rooms/get/authorization/invalid-auth-scheme',
        title:
          'specified auth-scheme for "authorization" header is not supported',
      })
      expect(statusCode).toBe(401)
    })

    it('returns error if the request auth token is invalid for the player', async () => {
      const createdRoomRes = await createTestRoom()
      const room = createdRoomRes.body
      const player = room.players[0]
      const { body, statusCode } = await await request(app)
        .get(`/rooms/${room.id}`)
        .set('Authorization', `Bearer ${player.id}:invalid-auth-token`)

      expect(body).toStrictEqual({
        type: '/rooms/get/authorization/invalid-token',
        title: 'authToken in "authorization" header is not valid',
      })
      expect(statusCode).toBe(401)
    })

    it('gets room by a unique id if authentication header is valid', async () => {
      const mockedTime = mockTime()
      const createParam: CreateTestRoomParam = {
        email: 'darth@vader.com',
        name: 'Darth Vader',
        technique: 'fibonacci',
      }
      const createdRoomRes = await createTestRoom(createParam)
      const room = createdRoomRes.body
      const player = room.players[0]

      const { body, statusCode } = await request(app)
        .get(`/rooms/${room.id}`)
        .set(
          'Authorization',
          `Bearer ${player.id}:${createAuthToken(player.id)}`,
        )

      expect(body).toStrictEqual({
        id: room.id,
        state: 'planning',
        technique: 'fibonacci',
        players: expect.arrayContaining([
          expect.objectContaining({
            id: createdRoomRes.body.players[0].id,
            name: 'Darth Vader',
            pictureURL: getPictureURLByEmail(createParam.email),
            estimate: null,
            isOwner: true,
            createdAt: mockedTime.toISOString(),
            updatedAt: null,
          }),
        ]),
        createdAt: mockedTime.toISOString(),
        updatedAt: null,
      })
      expect(body.id).toMatch(uuidRegex)
      expect(body.players[0].id).toMatch(uuidRegex)
      expect(body.players[0].roomId).toBe(body.id)
      expect(body.players[0].email).not.toBeDefined()
      expect(statusCode).toBe(200)
    })

    it('returns 404 error if roomId is not in rooms database', async () => {
      const { body: createdRoom } = await createTestRoom()
      const player = createdRoom.players[0]
      const nonExistingRoomId = '8b9be3d4-c522-4f1b-8bc2-b99f1fac4d44'

      const { body, statusCode } = await request(app)
        .get(`/rooms/${nonExistingRoomId}`)
        .set(
          'Authorization',
          `Bearer ${player.id}:${createAuthToken(player.id)}`,
        )

      expect(body).toStrictEqual({
        type: '/rooms/get/not-found',
        title: 'could not found the room with specified id',
      })
      expect(statusCode).toBe(404)
    })
  })
})
