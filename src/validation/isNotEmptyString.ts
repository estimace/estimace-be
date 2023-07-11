import { ValidationRule } from './types'

export const isNotEmptyString: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (value === undefined) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/undefined`,
        title: `"${name}" field is not defined`,
      },
    }
  }

  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/non-string`,
        title: `type of "${name}" field is not a string`,
      },
    }
  }

  if (value.trim() === '') {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/empty`,
        title: `"${name}" field is empty`,
      },
    }
  }

  return {
    isValid: true,
  }
}
