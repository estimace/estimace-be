import request from 'supertest'

import { app } from 'app/webApp'

export const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

export type CreateTestRoomParam = {
  name: string
  email: string
  technique: 'fibonacci' | 'tShirtSizing'
}
export const createRoomParam: CreateTestRoomParam = {
  email: 'darth@vader.com',
  name: 'Darth Vader',
  technique: 'fibonacci',
}
export type CreateTestPlayerParam = {
  name: string
  email: string
  roomId: string
}

export function mockTime(): Date {
  const mockedDate = new Date(2020, 7, 10)
  jest.useFakeTimers({ now: mockedDate })
  return mockedDate
}

export function restoreTimeMock() {
  jest.useRealTimers()
}

export const createTestRoom = async (
  param: CreateTestRoomParam = createRoomParam,
): Promise<request.Response> => {
  return await request(app).post('/rooms').send(param)
}

export const createTestPlayer = async (
  param: CreateTestPlayerParam,
): Promise<request.Response> => {
  return await request(app)
    .post(`/rooms/${param.roomId}/players`)
    .send({ name: param.name, email: param.email })
}
