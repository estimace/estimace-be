import { verifyAuthToken } from 'app/utils'
import { ValidationRule } from './types'

export const isValidAuthHeader: ValidationRule = (field) => {
  const { namespace, name, value } = field

  if (typeof value !== 'string' || value.trim() === '') {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/not-provided`,
        title: `"${name}" headers are not provided`,
      },
    }
  }

  if (!value.startsWith('Bearer ')) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid-auth-scheme`,
        title: `specified auth-scheme for "${name}" header is not supported`,
      },
    }
  }

  const [playerId, secretToken] = value.substring(7).split(':')
  if (!verifyAuthToken(playerId, secretToken)) {
    return {
      isValid: false,
      error: {
        type: `${namespace}/${name}/invalid-token`,
        title: `authToken in "${name}" header is not valid`,
      },
    }
  }

  return {
    isValid: true,
  }
}
