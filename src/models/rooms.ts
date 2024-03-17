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
import {
  formatPlayerRowToPlayer,
  generateURLFriendlyID,
} from 'app/models/utils'

type CreateRoomParam = {
  player: Pick<Player, 'name' | 'email'>
  technique: Technique
}

export async function createRoom(param: CreateRoomParam): Promise<Room> {
  type InsertParam = Omit<Room, 'players' | 'technique' | 'state'> & {
    state: number
    technique: number
  }

  if (typeof param.player.email === 'undefined') {
    throw new Error('email field can not be undefined')
  }

  const roomInsertParam: InsertParam = {
    id: generateURLFriendlyID(),
    state: ROOM_STATES.planning,
    technique: TECHNIQUES[param.technique],
    createdAt: new Date(),
    updatedAt: null,
  }

  const player: PlayerRow = {
    id: uuid(),
    roomId: roomInsertParam.id,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: true,
    createdAt: new Date(),
    updatedAt: null,
  }

  await db('rooms').insert(roomInsertParam)
  await db('players').insert(player)

  return {
    ...roomInsertParam,
    players: [formatPlayerRowToPlayer(player) as Player],
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
    .update({ state: ROOM_STATES[state], updatedAt: new Date() }, [
      'id',
      'state',
      'technique',
      'createdAt',
      'updatedAt',
    ])

  if (state === 'planning') {
    await db('players')
      .where({ roomId: roomsRows[0].id })
      .update({ estimate: null, updatedAt: new Date() })
  }

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
    players: playersRows.map(formatPlayerRowToPlayer) as Player[],
  }
  return room
}

type GetRoomLastUpdatedBeforeThreshold = (timestamp: number) => Promise<{
  roomId: Room['id']
  playersIds: PlayerRow['id'][]
} | null>

export const getRoomLastUpdatedBeforeThreshold: GetRoomLastUpdatedBeforeThreshold =
  async (threshold) => {
    const thresholdDate = new Date(threshold)
    const roomRow = await db('rooms')
      .select('id')
      .where(function () {
        this.where('createdAt', '<', thresholdDate).andWhere({
          updatedAt: null,
        })
      })
      .orWhere('updatedAt', '<', thresholdDate)
      .first()

    if (!roomRow) {
      return null
    }

    const playersRows = await db('players')
      .select('id')
      .where({ roomId: roomRow.id })

    return {
      roomId: roomRow.id,
      playersIds: playersRows.map((item) => item.id),
    }
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
