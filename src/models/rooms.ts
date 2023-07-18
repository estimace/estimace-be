import { v4 as uuid } from 'uuid'
import { db } from 'app/db'

import {
  Room,
  Player,
  Technique,
  RoomState,
  TECHNIQUES,
  ROOM_STATES,
} from './types'
import { PlayerRow } from 'knex/types/tables'
import {
  getRoomStateById,
  getTechniqueById,
  isValidEstimation,
} from 'app/utils'

type CreateRoomParam = {
  player: Pick<Player, 'name' | 'email'>
  technique: Technique
}

export async function createRoom(param: CreateRoomParam): Promise<Room> {
  type InsertParam = Omit<Room, 'players' | 'technique' | 'state'> & {
    state: number
    technique: number
  }

  const roomInsertParam: InsertParam = {
    id: uuid(),
    state: ROOM_STATES.planning,
    technique: TECHNIQUES[param.technique],
    createdAt: Date.now(),
    updatedAt: null,
  }

  const player: PlayerRow = {
    id: uuid(),
    roomId: roomInsertParam.id,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: true,
    createdAt: Date.now(),
    updatedAt: null,
  }

  await db('rooms').insert(roomInsertParam)
  await db('players').insert(player)

  return {
    ...roomInsertParam,
    players: [player],
    state: 'planning',
    technique: param.technique,
  }
}

export async function updateState(
  id: Room['id'],
  state: RoomState,
): Promise<Omit<Room, 'players'> | null> {
  const roomsRows = await db('rooms')
    .where({
      id,
    })
    .whereNot('state', ROOM_STATES[state])
    .update({ state: ROOM_STATES[state], updatedAt: Date.now() }, [
      'id',
      'state',
      'technique',
      'createdAt',
      'updatedAt',
    ])

  return roomsRows[0]
    ? {
        ...roomsRows[0],
        technique: getTechniqueById(roomsRows[0].technique) as Technique,
        state: getRoomStateById(roomsRows[0].state) as RoomState,
      }
    : null
}

export async function getRoom(
  id: string,
  options: { includePlayers: boolean } = { includePlayers: true },
): Promise<Room | null> {
  const roomRow = await db('rooms').where({ id }).first()
  if (!roomRow) {
    return null
  }

  let playersRows: PlayerRow[] = []
  if (options.includePlayers) {
    playersRows = await db('players').where({ roomId: id })
  }

  const room: Room = {
    ...roomRow,
    state: getRoomStateById(roomRow.state) as RoomState,
    technique: getTechniqueById(roomRow.technique) as Technique,
    players: playersRows.map((item) => ({
      ...item,
      isOwner: Boolean(item.isOwner),
    })),
  }
  return room
}

export async function deleteRoom(id: string): Promise<void> {
  return await db('rooms').where({ id }).delete()
}

export function isEstimationValidForRoom(
  room: Room,
  estimate: Player['estimate'],
): boolean {
  if (estimate === null) {
    return true
  }
  return isValidEstimation(room.technique, estimate)
}
