import { isNotEmptyString } from './isNotEmptyString'
import { isEmail } from './isEmail'
import { isTechnique } from './isTechnique'
import { isUUID } from './isUUID'
import { isNumber, isNumberOrNull } from './isNumber'
import { isRoomState } from './isRoomState'

export { validate } from './validation'
export const validators = {
  isNotEmptyString,
  isEmail,
  isTechnique,
  isUUID,
  isNumber,
  isNumberOrNull,
  isRoomState,
}
