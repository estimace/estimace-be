import { createAuthToken, time } from 'app/utils'
import {
  CreateTestRoomParam,
  createTestPlayer,
  createTestRoom,
  mockTime,
} from './utils'
import request from 'superwstest'
import { server } from 'app/server'
import { garbageCollectRooms } from 'app/backgroundTasks/garbageCollectRooms'
import { getRoom, updateState } from 'app/models/rooms'
import { WebSocket } from 'ws'

describe('Background tasks', () => {
  it('removes rooms which had updated at X-threshold milliseconds before, and closes the socket connection for related players', async () => {
    const threshold = 3 * time.day
    const createParam: CreateTestRoomParam = {
      email: 'darth@vader.com',
      name: 'Darth Vader',
      technique: 'fibonacci',
    }

    mockTime(new Date(1998, 0, 20))
    const { body: room1 } = await createTestRoom(createParam)
    const authToken = createAuthToken(room1.players[0].id)
    const room1WS = request(server).ws(
      `/socket?playerId=${room1.players[0].id}&authToken=${authToken}`,
    )
    expect(room1WS).toBeDefined()

    //create second room for test which has created and updated date of real time (today)
    mockTime(new Date(1998, 0, 21, 10, 10))
    const { body: room2 } = await createTestRoom(createParam)
    const authToken2 = createAuthToken(room2.players[0].id)
    const room2WS = request(server).ws(
      `/socket?playerId=${room2.players[0].id}&authToken=${authToken2}`,
    )
    const { body: player } = await createTestPlayer({
      name: 'Luke Skywalker',
      email: 'luke@skywalker.com',
      roomId: room2.id,
    })
    const room2PlayerWS = request(server).ws(
      `/socket?playerId=${player.id}&authToken=${createAuthToken(player.id)}`,
    )
    updateState(room2.id, 'revealed')
    expect(room2WS).toBeDefined()

    mockTime(new Date(1998, 0, 25))
    const { body: room3 } = await createTestRoom(createParam)
    const authToken3 = createAuthToken(room3.players[0].id)
    const room3WS = request(server).ws(
      `/socket?playerId=${room3.players[0].id}&authToken=${authToken3}`,
    )

    await garbageCollectRooms(threshold)
    expect(await getRoom(room1?.id)).toBe(null)
    expect(await getRoom(room2.id)).toBe(null)
    expect((await getRoom(room3.id))?.players).toHaveLength(1)
    room1WS.expectClosed()
    room2WS.expectClosed()
    room2PlayerWS.expectClosed()
    expect((await room3WS).readyState).toBe(WebSocket.OPEN)
  })
})
