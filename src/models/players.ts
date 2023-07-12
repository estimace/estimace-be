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
  player: Pick<Player, 'id' | 'estimate' | 'secretKey'>
  roomId: string
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
  param: PlayerEstimationParam,
): Promise<PlayerRow | null> {
  const room = await db('rooms').where({ id: param.roomId }).first()
  if (
    !room ||
    param.player.estimate === null ||
    !isValidEstimation(
      getTechniqueById(room.technique) as Technique,
      param.player.estimate,
    )
  )
    return null

  const playersRow = await db('players')
    .where({
      id: param.player.id,
      roomId: param.roomId,
    })
    .update({ estimate: param.player.estimate, updatedAt: Date.now() }, [
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
