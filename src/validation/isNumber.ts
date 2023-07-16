import { ValidationRule } from './types'

export const isNumber: ValidationRule = (field) => {
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

  if (typeof value !== 'number') {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/not-number`,
        title: `type of "${name}" field is not a valid number`,
      },
    }
  }

  return {
    isValid: true,
  }
}

export const isNumberOrNull: ValidationRule = (field) => {
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

  if (value !== null && typeof value !== 'number') {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/not-number-or-null`,
        title: `type of "${name}" field is not a valid number or null`,
      },
    }
  }

  return {
    isValid: true,
  }
}
