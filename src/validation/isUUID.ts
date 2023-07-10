import validator from 'validator'
import { ValidationRule } from './types'

export const isUUID: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (typeof value !== 'string') {
    throw new Error(
      'isUUID can only validate string values. use isNotEmpty validator before it to fix this.',
    )
  }

  if (!validator.isUUID(value)) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid`,
        title: `"${name}" field is not a valid UUID`,
      },
    }
  }

  return {
    isValid: true,
  }
}
