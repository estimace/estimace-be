import { v4 as uuid } from 'uuid'
import knex from 'knex'
import { config as knexConfig } from '../../knexfile'

const db = knex(knexConfig.development)

import { Room, Player, Technique, RoomState } from './types'
import { PlayerRow } from 'knex/types/tables'

type CreateRoomParam = {
  player: Pick<Player, 'name' | 'email'>
  technique: Technique
}

export async function createRoom(param: CreateRoomParam): Promise<Room> {
  const roomInsertParam: Omit<Room, 'players'> = {
    id: uuid(),
    state: RoomState.planning,
    technique: param.technique,
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
  }
}

export async function getRoom(id: string): Promise<Room | null> {
  const roomRow = await db('rooms').where({ id }).first()
  if (!roomRow) return null

  const playersRows = await db('players').where({ roomId: id })
  const room: Room = {
    ...roomRow,
    players: playersRows.map((item) => ({
      ...item,
      isOwner: Boolean(item.isOwner),
    })),
  }

  return room
}
