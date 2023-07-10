import request from 'supertest'
import { app } from 'app/app'
import { uuidRegex } from './utils'

describe('Rooms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates room by getting owner name, owner email, and estimation technique', async () => {
    const timeSpy = jest.spyOn(Date, 'now').mockReturnValue(1597017600000)
    const { body, statusCode } = await request(app).post('/rooms').send({
      email: 'john@smith.com',
      name: 'John Smith',
      technique: 'fibonacci',
    })

    expect(body).toStrictEqual(
      expect.objectContaining({
        state: 1,
        technique: 'fibonacci',
        players: expect.arrayContaining([
          expect.objectContaining({
            email: 'john@smith.com',
            name: 'John Smith',
            estimate: null,
            isOwner: true,
            createdAt: 1597017600000,
            updatedAt: null,
          }),
        ]),
        createdAt: 1597017600000,
        updatedAt: null,
      }),
    )
    expect(statusCode).toBe(201)
    expect(body.id).toMatch(uuidRegex)
    expect(body.players[0].id).toMatch(uuidRegex)
    expect(body.players[0].roomId).toBe(body.id)
  })

  it('returns error if email address is invalid', async () => {
    const { body, statusCode } = await request(app).post('/rooms').send({
      email: 'johnsmith.com',
      name: 'John Smith',
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
      name: 'John Smith',
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
      name: 'John Smith',
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
      name: 'John Smith',
      technique: 'fibonacci',
    })

    expect(statusCode).toBe(400)
    expect(body).toStrictEqual({
      type: '/rooms/create/email/non-string',
      title: 'type of "email" field is not a string',
    })
  })

  it('returns error if player name is empty', async () => {
    const { body, statusCode } = await request(app).post('/rooms').send({
      email: 'john@smith.com',
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
      email: 'john@smith.com',
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
      email: 'john@smith.com',
      name: 120,
      technique: 'fibonacci',
    })

    expect(statusCode).toBe(400)
    expect(body).toStrictEqual({
      type: '/rooms/create/name/non-string',
      title: 'type of "name" field is not a string',
    })
  })

  it('returns error if estimation technique is undefined', async () => {
    const { body, statusCode } = await request(app).post('/rooms').send({
      email: 'john@smith.com',
      name: 'John Smith',
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
      email: 'john@smith.com',
      name: 'John Smith',
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
      email: 'john@smith.com',
      name: 'John Smith',
      technique: 'estimation-technique',
    })

    expect(statusCode).toBe(400)
    expect(body).toStrictEqual({
      type: '/rooms/create/technique/invalid',
      title: '"technique" field is not a valid estimation technique',
    })
  })
})
