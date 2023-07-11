import { RequestHandler } from 'express'
import { createRoom, getRoom } from 'app/models/rooms'
import { validate, validators } from 'app/validation'

export const create: RequestHandler = async (req, res, next) => {
  const validationResult = validate('/rooms/create', req.body, {
    name: [validators.isNotEmptyString],
    email: [validators.isNotEmptyString, validators.isEmail],
    technique: [validators.isNotEmptyString, validators.isTechnique],
  })

  if (!validationResult.isValid) {
    return res.status(400).json(validationResult.error)
  }

  const room = await createRoom({
    technique: req.body.technique,
    player: {
      name: req.body.name,
      email: req.body.email,
    },
  })

  res.status(201).json(room)
}

export const get: RequestHandler = async (req, res, next) => {
  const validationResult = validate('/rooms/get', req.params, {
    id: [validators.isUUID],
  })

  if (!validationResult.isValid) {
    return res.status(404).json(validationResult.error)
  }

  const room = await getRoom(req.params.id)
  if (!room) {
    return res.status(404).json({
      type: '/rooms/get/no-found',
      title: 'could not found the room with specified id',
    })
  }

  res.status(200).json(room)
}
