import { Knex } from 'knex'

export const TECHNIQUES = {
  fibonacci: 1,
  tShirtSizing: 2,
}
export type Technique = keyof typeof TECHNIQUES

export const ROOM_STATES = {
  planning: 1,
  revealed: 2,
}
export type RoomState = keyof typeof ROOM_STATES

export type Room = {
  id: string
  state: RoomState
  technique: Technique
  players: Player[]
  createdAt: number
  updatedAt: number | null
}

export type Player = {
  id: string
  roomId: Room['id']
  name: string
  email: string
  isOwner: boolean
  estimate: number | null
  createdAt: number
  updatedAt: number | null
  secretKey?: string
}

declare module 'knex/types/tables' {
  interface RoomRow {
    id: string
    state: number
    technique: number
    createdAt: number
    updatedAt: number | null
  }

  interface PlayerRow {
    id: string
    roomId: string
    name: string
    email: string
    isOwner: boolean
    estimate: number | null
    createdAt: number
    updatedAt: number | null
  }

  interface Tables {
    rooms: RoomRow
    players: PlayerRow
    rooms_composite: Knex.CompositeTableType<
      RoomRow,
      Pick<RoomRow, 'id' | 'technique'>,
      Partial<Omit<RoomRow, 'id' | 'createdAt'>>
    >
    players_composite: Knex.CompositeTableType<
      PlayerRow,
      Pick<PlayerRow, 'name' | 'email'>,
      Partial<Omit<PlayerRow, 'id'>>
    >
  }
}
