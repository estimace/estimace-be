import { isNotEmptyString } from './isNotEmptyString'
import { isEmail } from './isEmail'
import { isTechnique } from './isTechnique'
import { isUUID } from './isUUID'
import { isNumber } from './isNumber'

export { validate } from './validation'
export const validators = {
  isNotEmptyString,
  isEmail,
  isTechnique,
  isUUID,
  isNumber,
}
