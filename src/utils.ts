import crypto from 'crypto'
import { Technique } from './models/types'

type TechniquesOptions = Record<Technique, string[]>

export const techniqueOptions: TechniquesOptions = {
  [Technique.fibonacci]: [
    '0',
    '0.5',
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '20',
    '40',
    '100',
    '?',
  ],
  [Technique.tShirtSizing]: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '?'],
}

function createAuthToken(playerId: string) {
  return crypto
    .createHmac('sha256', process.env.SEED as string)
    .update(playerId)
    .digest('hex')
}

function verifyAuthToken(data: string, authToken: string): boolean {
  return createAuthToken(data) === authToken
}

function isValidEstimation(technique: Technique, value: number) {
  return value < techniqueOptions[technique].length
}

export { createAuthToken, verifyAuthToken, isValidEstimation }
