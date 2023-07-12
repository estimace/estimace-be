import { Knex } from 'knex'

export const TECHNIQUES = {
  fibonacci: 1,
  tShirtSizing: 2,
}
export type Technique = keyof typeof TECHNIQUES

export enum RoomState {
  planning = 1,
  revealed,
}

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
    state: RoomState
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
