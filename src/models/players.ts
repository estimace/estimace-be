import { v4 as uuid } from 'uuid'
import { db } from 'app/db'

import { Player, Technique } from './types'
import { PlayerRow } from 'knex/types/tables'
import { isValidEstimation, getTechniqueById } from '../utils'

type AddPlayerParam = {
  player: Pick<Player, 'name' | 'email'>
  roomId: string
}

type PlayerEstimationParam = {
  player: Pick<Player, 'id' | 'estimate'>
}

export async function addPlayerToRoom(
  param: AddPlayerParam,
): Promise<PlayerRow> {
  const room = await db('rooms').where({ id: param.roomId }).first()
  const player: PlayerRow = {
    id: uuid(),
    roomId: param.roomId,
    email: param.player.email,
    name: param.player.name,
    estimate: null,
    isOwner: false,
    createdAt: Date.now(),
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
    .update({ estimate: estimate, updatedAt: Date.now() }, [
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
