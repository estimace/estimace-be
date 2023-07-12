import { v4 as uuid } from 'uuid'
import { db } from 'app/db'

import { Room, Player, Technique, RoomState, TECHNIQUES } from './types'
import { PlayerRow } from 'knex/types/tables'
import { getTechniqueById } from 'app/utils'

type CreateRoomParam = {
  player: Pick<Player, 'name' | 'email'>
  technique: Technique
}

export async function createRoom(param: CreateRoomParam): Promise<Room> {
  type InsertParam = Omit<Room, 'players' | 'technique'> & {
    technique: number
  }

  const roomInsertParam: InsertParam = {
    id: uuid(),
    state: RoomState.planning,
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
    technique: param.technique,
  }
}

export async function getRoom(id: string): Promise<Room | null> {
  const roomRow = await db('rooms').where({ id }).first()
  if (!roomRow) {
    return null
  }

  const playersRows = await db('players').where({ roomId: id })

  const room: Room = {
    ...roomRow,
    technique: getTechniqueById(roomRow.technique) as Technique,
    players: playersRows.map((item) => ({
      ...item,
      isOwner: Boolean(item.isOwner),
    })),
  }
  return room
}
