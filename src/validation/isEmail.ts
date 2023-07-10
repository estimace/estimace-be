import validator from 'validator'
import { ValidationRule } from './types'

export const isEmail: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (typeof value !== 'string') {
    throw new Error(
      'isEmail can only validate string values. use isNotEmpty validator before it to fix this.',
    )
  }

  if (!validator.isEmail(value)) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid`,
        title: `"${name}" field is not a valid email address`,
      },
    }
  }

  return {
    isValid: true,
  }
}
