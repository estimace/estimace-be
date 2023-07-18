import { ValidationRule } from './types'
import { ROOM_STATES } from 'app/models/types'

export const isRoomState: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (typeof value !== 'string') {
    throw new Error(
      'isRoomState can only validate string values. use isNotEmpty validator before it to fix this error.',
    )
  }

  if (!(value in ROOM_STATES)) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid`,
        title: `"${name}" field is not a valid state for the room`,
      },
    }
  }

  return {
    isValid: true,
  }
}
