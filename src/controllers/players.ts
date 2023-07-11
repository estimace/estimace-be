import { RequestHandler } from 'express'
import { addPlayerToRoom, updatePlayerEstimation } from 'app/models/players'
import { validate, validators } from 'app/validation'

export const create: RequestHandler = async (req, res, next) => {
  const validationResult = validate('/rooms/id/players/create', req.body, {
    name: [validators.isNotEmptyString],
    email: [validators.isNotEmptyString, validators.isEmail],
    roomId: [validators.isNotEmptyString, validators.isUUID],
  })

  if (!validationResult.isValid) {
    return res.status(400).json(validationResult.error)
  }

  const player = await addPlayerToRoom({
    roomId: req.body.roomId,
    player: {
      name: req.body.name,
      email: req.body.email,
    },
  })

  res.status(201).json(player)
}

export const updatePlayer: RequestHandler = async (req, res, next) => {
  const validationResult = validate(
    '/rooms/id/players/estimations',
    req.params,
    {
      playerId: [validators.isNotEmptyString, validators.isUUID],
      roomId: [validators.isNotEmptyString, validators.isUUID],
      estimation: [validators.isNumber],
    },
  )

  if (!validationResult.isValid) {
    return res.status(404).json(validationResult.error)
  }

  const player = await updatePlayerEstimation({
    player: {
      estimate: req.body.estimate,
      id: req.body.playerId,
      secretKey: req.body.secretKey,
    },
    roomId: req.body.roomId,
  })
  if (!player) {
    return res.status(404).json({
      type: '/rooms/id/players/estimations/update/no-found',
      title: 'could not found the player in specified room',
    })
  }

  res.status(200).json(player)
}
