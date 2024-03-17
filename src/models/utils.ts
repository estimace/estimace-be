import md5 from 'md5'
import { customAlphabet } from 'nanoid'
import { Player } from 'app/models/types'
import { PlayerRow } from 'knex/types/tables'
import validator from 'validator'

export function formatPlayerRowToPlayer(
  playerRow: PlayerRow | undefined,
): Player | null {
  if (!playerRow) {
    return null
  }
  return {
    ...playerRow,
    pictureURL: getPictureURLByEmail(playerRow.email),
  }
}

export function getPictureURLByEmail(email: string) {
  if (!email) {
    return null
  }

  const normalizedEmail = validator.normalizeEmail(email)
  if (!normalizedEmail) {
    return null
  }

  const hash = md5(normalizedEmail)
  return `https://www.gravatar.com/avatar/${hash}?d=retro`
}

const nanoId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  16,
)
export function generateURLFriendlyID() {
  return nanoId()
}
