import { v4 as uuid } from 'uuid'
import { db } from 'app/db'

import { Player, Room } from './types'
import { PlayerRow } from 'knex/types/tables'
import { formatPlayerRowToPlayer } from 'app/models/utils'

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
  if (typeof param.player.email === 'undefined') {
    throw new Error('email field can not be undefined')
  }

  const playerRow: PlayerRow = {
    id: uuid(),
    roomId: param.roomId,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: false,
    createdAt: new Date(),
    updatedAt: null,
  }
  await db('players').insert(playerRow)
  return formatPlayerRowToPlayer(playerRow) as Player
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
  return formatPlayerRowToPlayer(playersRow[0])
}

export async function getPlayer(id: Player['id']): Promise<Player | null> {
  const playerRow = await db('players').where({ id }).first()
  return formatPlayerRowToPlayer(playerRow)
}
