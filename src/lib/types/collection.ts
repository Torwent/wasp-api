import type { Database } from "$lib/types/supabase"

export type Prices = Database["public"]["Tables"]["prices"]["Row"]

export type ProfileBase = Database["profiles"]["Tables"]["profiles"]["Row"]
export type ProfileRoles = Database["profiles"]["Tables"]["roles"]["Row"]
export type ProfilePrivate = Database["profiles"]["Tables"]["private"]["Row"]
export type ProfileSubscription = Database["profiles"]["Tables"]["subscriptions"]["Row"]
export interface Profile extends ProfileBase {
	private: ProfilePrivate
	roles: ProfileRoles
	subscriptions: ProfileSubscription
}

export type Stats = {
	experience: number
	gold: number
	id: string
	password: string
	runtime: number
	username: string
}

export type ScriptBase = Database["scripts"]["Tables"]["scripts"]["Row"]
export type ScriptProtected = Database["scripts"]["Tables"]["protected"]["Row"]
export type StatsSimba = Database["scripts"]["Tables"]["stats_simba"]["Row"]
export type StatsSite = Database["scripts"]["Tables"]["stats_site"]["Row"]

export interface ScriptLimits {
	id: Database["scripts"]["Tables"]["scripts"]["Row"]["id"]
	min_xp: number
	min_gp: number
	max_xp: number
	max_gp: number
}

export interface Script extends ScriptBase {
	srlt_version?: string
	wasplib_version?: string
	protected: ScriptProtected
}

export interface UserEntry {
	script_id?: string
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

interface CurrentUser {
	id: string
	time: number
}

export interface ScriptEntry {
	userID?: string
	experience: number
	gold: number
	runtime: number
	unique_users: string[]
	online_users: CurrentUser[]
}

export interface Payload {
	script_id: string
	username: string
	experience: number
	gold: number
	runtime: number
}

export interface RawPayload {
	script_id: string | undefined
	username?: string | undefined
	password?: string | undefined
	experience: number | undefined
	gold: number | undefined
	runtime: number | undefined
}

export interface ScriptResponse {
	id?: string
	title?: string
	author?: string
	revision?: number
	srlt_version?: string
	wasplib_version?: string
}

export interface PackagesData {
	srlt_version: string
	wasplib_version: string
}
