import { v4 as uuid } from 'uuid'
import { db } from 'app/db'

import { Player, Room } from './types'
import { PlayerRow } from 'knex/types/tables'

type AddPlayerParam = {
  player: Pick<Player, 'name' | 'email'>
  roomId: string
}

export async function getRoomPlayersIds(
  roomId: Room['id'],
): Promise<Player['id'][]> {
  const rows = await db('players').select('id').where({ roomId })
  return rows.map((item) => item.id)
}

export async function addPlayerToRoom(param: AddPlayerParam): Promise<Player> {
  const player: PlayerRow = {
    id: uuid(),
    roomId: param.roomId,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: false,
    createdAt: new Date(),
    updatedAt: null,
  }
  await db('players').insert(player)

  return player
}

export async function updatePlayerEstimation(
  id: Player['id'],
  estimate: Player['estimate'],
): Promise<Player | null> {
  const playersRow = await db('players')
    .where({
      id,
    })
    .update({ estimate: estimate, updatedAt: new Date() }, [
      'id',
      'roomId',
      'name',
      'email',
      'isOwner',
      'estimate',
      'createdAt',
      'updatedAt',
    ])

  return playersRow[0] ?? null
}

export async function getPlayer(id: Player['id']): Promise<Player | null> {
  return (await db('players').where({ id }).first()) ?? null
}
