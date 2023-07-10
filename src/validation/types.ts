export type ValidationResult =
  | {
      isValid: true
    }
  | {
      isValid: false
      error: ValidationError
    }

export type ValidationError = {
  type: string
  title: string
}

export type ValidationRule = (field: {
  namespace: string
  name: string
  value: unknown
}) => ValidationResult

export type ValidateFn = (
  namespace: string,
  obj: Record<string, unknown>,
  rules: { [key: string]: ValidationRule[] },
) => ValidationResult
