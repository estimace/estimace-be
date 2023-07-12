import crypto from 'crypto'
import config from 'app/config'
import { TECHNIQUES, Technique } from './models/types'

type TechniquesOptions = Record<Technique, string[]>

export const techniqueOptions: TechniquesOptions = {
  fibonacci: [
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
  tShirtSizing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '?'],
}

export function createAuthToken(playerId: string) {
  return crypto
    .createHmac('sha256', config.authTokenSeed as string)
    .update(playerId)
    .digest('hex')
}

export function verifyAuthToken(data: string, authToken: string): boolean {
  return createAuthToken(data) === authToken
}

export function isValidEstimation(technique: Technique, value: number) {
  return value >= 0 && value < techniqueOptions[technique].length
}

export function getTechniqueById(id: Number): Technique | null {
  for (const key in TECHNIQUES) {
    if (TECHNIQUES[key as Technique] === id) {
      return key as Technique
    }
  }
  return null
}
