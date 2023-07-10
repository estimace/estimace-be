import { ValidationRule } from './types'
import { Technique } from 'app/models/types'

export const isTechnique: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (typeof value !== 'string') {
    throw new Error(
      'isTechnique can only validate string values. use isNotEmpty validator before it to fix this error.',
    )
  }

  if (!(value in Technique)) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid`,
        title: `"${name}" field is not a valid estimation technique`,
      },
    }
  }

  return {
    isValid: true,
  }
}
