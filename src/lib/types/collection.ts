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
	xp_min: number
	xp_max: number
	gp_min: number
	gp_max: number
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
	experience: t.Number({ minimum: 0 }),
	gold: t.Number(),
	runtime: t.Number({ minimum: 0, maximum: 15 * 60 * 1000 })
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
