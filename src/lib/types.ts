export interface StatsEntry {
  id?: string | null | undefined
  username?: string | null | undefined
  password?: string | null | undefined
  biohash?: number
  experience: number
  gold: number
  runtime: number
  banned: boolean
}

export interface StatsScriptEntry {
  id?: string
  experience?: number
  gold?: number
  levels?: number
  runtime?: number
  unique_users?: number[]
  banned_users?: number[]
  ban_at_runtime?: number[]
  current_users?: number[]
  xp_req_limit: number
  gp_req_limit: number
  min_xp: number
  min_gp: number
  max_xp: number
  max_gp: number
}

export interface Payload {
  script_id: string
  username: string
  experience: number
  gold: number
  runtime: number
  banned: boolean
}

export interface RawPayload {
  username?: string | undefined
  password?: string | undefined
  script_id: string | undefined
  experience: number | undefined
  gold: number | undefined
  runtime: number | undefined
  banned: boolean | undefined
}
