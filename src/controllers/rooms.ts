import { RequestHandler } from 'express'
import { createRoom } from 'app/models/rooms'
import { validate, validators } from 'app/validation'

export const create: RequestHandler = async (req, res, next) => {
  const validationResult = validate('/rooms/create', req.body, {
    name: [validators.isNotEmpty],
    email: [validators.isNotEmpty, validators.isEmail],
    technique: [validators.isNotEmpty, validators.isTechnique],
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
export const getRoom: RequestHandler = (req, res, next) => {}
