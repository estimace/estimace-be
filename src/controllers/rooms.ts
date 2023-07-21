import { RequestHandler } from 'express'
import {
  createRoom,
  getRoom,
  updateState as updateRoomState,
} from 'app/models/rooms'
import { validate, validators } from 'app/validation'
import { WSMessageHandler } from 'app/wss/types'
import { getPlayer, getRoomPlayersIds } from 'app/models/players'
import { RoomState } from 'app/models/types'
import { createAuthToken } from 'app/utils'

export const create: RequestHandler = async (req, res, next) => {
  const validationResult = validate('/rooms/create', req.body, {
    name: [validators.isNotEmptyString, validators.isStringWithMaxLength(255)],
    email: [
      validators.isNotEmptyString,
      validators.isStringWithMaxLength(255),
      validators.isEmail,
    ],
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
  room.players[0].authToken = createAuthToken(room.players[0].id)
  delete room.players[0].email

  res.status(201).json(room)
}

export const get: RequestHandler = async (req, res, next) => {
  let validationResult = validate('/rooms/get', req.params, {
    id: [validators.isUUID],
  })
  if (!validationResult.isValid) {
    return res.status(404).json(validationResult.error)
  }

  const room = await getRoom(req.params.id)
  if (!room) {
    return res.status(404).json({
      type: '/rooms/get/not-found',
      title: 'could not found the room with specified id',
    })
  }
  room.players.forEach((item) => delete item.email)

  res.status(200).json(room)
}

export const updateState: WSMessageHandler = async (req, res) => {
  const validationResult = validate('/rooms/update/state', req.payload, {
    state: [validators.isNotEmptyString, validators.isRoomState],
  })

  if (!validationResult.isValid) {
    const { type, title } = validationResult.error
    return res.sendError(type, title)
  }

  let player = await getPlayer(req.connectionParam.playerId)
  if (!player) {
    return res.sendError(
      '/rooms/update/state/player/not-found',
      'could not found the player',
    )
  }
  if (!player.isOwner) {
    return res.sendError(
      '/rooms/update/state/player/not-room-owner',
      'the player does not have the authority to change the state of the room',
    )
  }

  const room = await getRoom(player.roomId, { includePlayers: false })
  if (!room) {
    return res.sendError(
      '/rooms/update/state/room/not-found',
      'could not found the room',
    )
  }
  if (room.state === req.payload.state) {
    return res.sendError(
      '/rooms/update/state/sameState',
      'The requested state is the same as room state',
    )
  }

  const updatedRoom = await updateRoomState(
    room.id,
    req.payload.state as RoomState,
  )
  if (!updatedRoom) {
    return res.sendError(
      '/rooms/update/state/error-updating-db',
      'un error occurred while updating the room state in the database',
    )
  }

  res.sendMessage('roomStateUpdated', updatedRoom)

  const roomPlayersIds = await getRoomPlayersIds(room.id)
  res.broadcastMessage('roomStateUpdated', updatedRoom, roomPlayersIds)
}
