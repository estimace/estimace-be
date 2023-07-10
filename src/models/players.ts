import { v4 as uuid } from 'uuid'
import knex from 'knex'
import { config as knexConfig } from '../../knexfile'

import { Player, Technique } from './types'
import { PlayerRow } from 'knex/types/tables'
import { createAuthToken, verifyAuthToken, isValidEstimation } from '../utils'

const db = knex(knexConfig.development)

type AddPlayerParam = {
  player: Pick<Player, 'name' | 'email'>
  roomId: string
}

type PlayerEstimationParam = {
  player: Pick<Player, 'id' | 'estimate' | 'secretKey'>
  roomId: string
}

export async function addPlayerToRoom(param: AddPlayerParam): Promise<Player> {
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

  const secretKey = createAuthToken(player.id)
  return { ...player, secretKey } as Player
}

export async function updatePlayerEstimation(
  param: PlayerEstimationParam,
): Promise<PlayerRow | null> {
  if (!verifyAuthToken(param.player.id, param.player.secretKey as string))
    return null

  const room = await db('rooms').where({ id: param.roomId }).first()

  if (
    !room ||
    param.player.estimate === null ||
    !isValidEstimation(room.technique as Technique, param.player.estimate)
  )
    return null

  const playersRow = await db('players')
    .where({
      id: param.player.id,
      roomId: param.roomId,
    })
    .whereNull('roomId')
    .update({ estimate: param.player.estimate }, [
      'id',
      'roomId',
      'name',
      'email',
      'isOwner',
      'estimate',
      'createdAt',
      'updatedAt',
    ])
    .first()

  return playersRow ? playersRow : null
}
