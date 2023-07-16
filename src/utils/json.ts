export function parseJSON(value: string): unknown {
  try {
    return JSON.parse(value) as {}
  } catch (_) {
    return null
  }
}
