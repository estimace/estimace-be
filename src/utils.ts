import crypto from 'crypto'

function createAuthToken(playerId: string) {
  return crypto
    .createHmac('sha256', process.env.SEED as string)
    .update(playerId)
    .digest('hex')
}

function verifyAuthToken(data: string, authToken: string): boolean {
  return createAuthToken(data) === authToken
}

export { createAuthToken, verifyAuthToken }
