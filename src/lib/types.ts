export interface UserEntry {
  scriptID?: string
  userID?: string
  username?: string | null | undefined
  password?: string | null | undefined
  experience: number
  gold: number
  runtime: number
}

export interface RawScriptEntry {
  userID?: string
  experience?: number
  gold?: number
  levels?: number
  runtime?: number
  unique_users?: string[]
  current_users?: string[]
  min_xp: number
  min_gp: number
  max_xp: number
  max_gp: number
}

export interface ScriptEntry {
  userID?: string
  experience: number
  gold: number
  levels?: number
  runtime: number
  min_xp?: number
  min_gp?: number
  max_xp?: number
  max_gp?: number
}

export interface Payload {
  scriptID: string
  username: string
  experience: number
  gold: number
  runtime: number
}

export interface RawPayload {
  scriptID: string | undefined
  username?: string | undefined
  password?: string | undefined
  experience: number | undefined
  gold: number | undefined
  runtime: number | undefined
}
