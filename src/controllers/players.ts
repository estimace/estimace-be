import { RequestHandler } from 'express'

import config from 'app/config'
import {
  addPlayerToRoom,
  getPlayer,
  getRoomPlayersIds,
  updatePlayerEstimation,
} from 'app/models/players'
import { validate, validators } from 'app/validation'
import { createAuthToken } from 'app/utils'
import { getRoom, isEstimationValidForRoom } from 'app/models/rooms'
import { WSMessageHandler } from 'app/wss/types'
import { broadcastMessage } from 'app/wss'

export const create: RequestHandler = async (req, res, next) => {
  const roomId = req.params.id
  const validationResult = validate(
    '/rooms/players/create',
    { ...req.body, roomId },
    {
      name: [validators.isNotEmptyString],
      email: [validators.isNotEmptyString, validators.isEmail],
      roomId: [validators.isNotEmptyString],
    },
  )

  if (validationResult.isValid === false) {
    return res.status(400).json(validationResult.error)
  }

  const room = await getRoom(roomId)
  if (!room) {
    return res.status(400).json({
      type: '/rooms/players/create/roomId/not-found',
      title: 'room is not found',
    })
  }

  if (room.players.length >= config.playersPerRoomLimit) {
    return res.status(400).json({
      type: '/rooms/players/create/players-per-room-limit-reached',
      title:
        'The number of players in room has already reached the maximum limit of players per room',
    })
  }

  const player = await addPlayerToRoom({
    roomId,
    player: {
      name: req.body.name,
      email: req.body.email,
    },
  })
  /***
   * we have gotten the room before adding new player, so
   * the room has all of its players except the newly joined player.
   * we can broadcast new player's joining to all of these players
   */
  broadcastMessage(
    'newPlayerJoined',
    {
      id: player.id,
      roomId: player.roomId,
      name: player.name,
      pictureURL: player.pictureURL,
      isOwner: player.isOwner,
      createdAt: player.createdAt,
      estimate: player.estimate,
      updatedAt: player.updatedAt,
    },
    room.players.map((item) => item.id),
  )

  const authToken = createAuthToken(player.id)

  res.status(201).json({ ...player, authToken, email: undefined })
}

export const updateEstimate: WSMessageHandler = async (req, res) => {
  const { estimate } = req.payload
  const validationResult = validate(
    '/rooms/player/estimate/update',
    req.payload,
    {
      estimate: [validators.isNumberOrNull],
    },
  )

  if (validationResult.isValid === false) {
    const { type, title } = validationResult.error
    return res.sendError(type, title)
  }

  let player = await getPlayer(req.connectionParam.playerId)
  if (!player) {
    return res.sendError(
      '/rooms/player/estimate/update/player/not-found',
      'could not found the player',
    )
  }

  const room = await getRoom(player.roomId, { includePlayers: false })
  if (!room) {
    return res.sendError(
      '/rooms/player/estimate/update/room/not-found',
      'could not found the room',
    )
  }

  if (room.state === 'revealed') {
    return res.sendError(
      '/rooms/player/estimate/update/room/not-planning',
      'can not update the estimate while room is not in "planning" state',
    )
  }

  // We are asserting `estimate` type to number or null as we are sure about
  // the type of it by using the validator function isNumberOrNull
  if (!isEstimationValidForRoom(room, estimate as number | null)) {
    return res.sendError(
      '/rooms/player/estimate/update/estimate/out-of-range',
      'estimate value is not in the range of valid estimates for the room',
    )
  }

  player = await updatePlayerEstimation(
    req.connectionParam.playerId,
    req.payload.estimate as number,
  )

  if (player) {
    delete player.email
    res.sendMessage('estimateUpdated', player)
    const roomPlayersIds = await getRoomPlayersIds(room.id)
    res.broadcastMessage('estimateUpdated', player, roomPlayersIds)
  }
}
