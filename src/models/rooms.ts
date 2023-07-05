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
  const room: Room = {
    id: uuid(),
    state: RoomState.planning,
    technique: param.technique,
    players: [],
    createdAt: Date.now(),
    updatedAt: null,
  }

  const player: PlayerRow = {
    id: uuid(),
    roomId: room.id,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: true,
    createdAt: Date.now(),
    updatedAt: null,
  }

  await db('rooms').insert(room)
  await db('players').insert(player)

  room.players = [player]
  return room
}

export async function getRoom(id: string): Promise<Room | null> {
  const roomRow = await db('rooms').where({ id }).first()
  if (!roomRow) return null

  const playersRows = await db('players').where({ roomId: id })
  const room: Room = {
    ...roomRow,
    players: playersRows,
  }

  return room
}
