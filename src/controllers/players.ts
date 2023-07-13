import { RequestHandler } from 'express'
import { addPlayerToRoom, updatePlayerEstimation } from 'app/models/players'
import { validate, validators } from 'app/validation'
import { verifyAuthToken, createAuthToken } from 'app/utils'
import { Player } from 'app/models/types'
import { getRoom } from 'app/models/rooms'

export const create: RequestHandler = async (req, res, next) => {
  const roomId = req.params.id
  const validationResult = validate(
    '/rooms/players/create',
    { ...req.body, roomId },
    {
      name: [validators.isNotEmptyString],
      email: [validators.isNotEmptyString, validators.isEmail],
      roomId: [validators.isNotEmptyString, validators.isUUID],
    },
  )

  if (!validationResult.isValid) {
    return res.status(400).json(validationResult.error)
  }

  const room = await getRoom(roomId)
  if (!room) {
    return res.status(400).json({
      type: '/rooms/players/create/roomId/not-found',
      title: 'room is not found',
    })
  }

  const player = await addPlayerToRoom({
    roomId,
    player: {
      name: req.body.name,
      email: req.body.email,
    },
  })

  const secretKey = createAuthToken(player.id)

  res.status(201).json({ ...player, secretKey } as Player)
}

export const updatePlayer: RequestHandler = async (req, res, next) => {
  const roomId = req.params.roomId
  const validationResult = validate(
    '/rooms/player/estimate',
    { ...req.body, roomId },
    {
      playerId: [validators.isNotEmptyString, validators.isUUID],
      roomId: [validators.isNotEmptyString, validators.isUUID],
      estimate: [validators.isNumber],
    },
  )

  if (!validationResult.isValid) {
    return res.status(404).json(validationResult.error)
  }

  const room = await getRoom(roomId)
  if (!room) {
    return res.status(400).json({
      type: '/rooms/player/estimate/update/not-found',
      title: 'room is not found',
    })
  }
  if (!verifyAuthToken(req.body.playerId, req.body.secretKey as string)) {
    return res.status(401).json({
      type: '/rooms/player/unauthorized',
      title: 'The player has not provided valid authentication',
    })
  }

  const player = await updatePlayerEstimation({
    player: {
      estimate: req.body.estimate,
      id: req.body.playerId,
      secretKey: req.body.secretKey,
    },
    roomId,
  })

  if (!player) {
    return res.status(400).json({
      type: '/rooms/player/estimate/update/no-found',
      title: 'could not found the player in specified room',
    })
  }

  res.status(200).json(player)
}
