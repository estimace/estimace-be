import { ValidationRule } from './types'

type IsStringWithMaxLength = (maxLength: number) => ValidationRule

export const isStringWithMaxLength: IsStringWithMaxLength =
  (maxLength) => (field) => {
    const { namespace, name, value } = field

    if (value === undefined || typeof value !== 'string') {
      throw new Error(
        'isStringWithMaxLength can only validate string values. use isNotEmpty validator before it to fix this.',
      )
    }

    if (value.length > maxLength) {
      return {
        isValid: false,
        error: {
          type: `${namespace}/${name}/too-long`,
          title: `length of "${name}" field can not be greater than ${maxLength}`,
        },
      }
    }

    return {
      isValid: true,
    }
  }
