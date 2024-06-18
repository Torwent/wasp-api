import { t } from "$src/index"
import { Static } from "elysia"

export interface Script {
	id: string
	title: string
	protected: {
		revision: number
		username: string
	}
}

export interface Limit {
	min_xp: number
	max_xp: number
	min_gp: number
	max_gp: number
}

export interface ProfileRoles {
	id: string
	roles: {
		administrator: boolean
		banned: boolean
		developer: boolean
		moderator: boolean
		premium: boolean
		scripter: boolean
		tester: boolean
		timeout: boolean
		vip: boolean
	}
}

export const StatsSchema = t.Object({
	script_id: t.String({ format: "uuid" }),
	username: t.Optional(t.String()),
	password: t.String(),
	experience: t.Numeric(),
	gold: t.Numeric(),
	runtime: t.Numeric()
})

export type StatsPayload = Static<typeof StatsSchema>

export interface OnlineUsers {
	id: string
	time: number
}

export interface ScriptStats {
	id: string
	user_id: string
	experience: number
	gold: number
	runtime: number
}

export interface CachedScript {
	script: Script
	timestamp: number
}

export interface CachedLimit {
	limit: Limit
	timestamp: number
}
