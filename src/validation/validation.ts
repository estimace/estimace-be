import { ValidateFn } from './types'

export const validate: ValidateFn = (namespace, obj, rules) => {
  const objProps = Object.keys(rules)
  for (const objProp of objProps) {
    for (const rule of rules[objProp]) {
      const result = rule({
        namespace,
        name: objProp,
        value: obj[objProp],
      })
      if (!result.isValid) {
        return result
      }
    }
  }

  return {
    isValid: true,
  }
}
