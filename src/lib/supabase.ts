import { PostgrestError, createClient } from "@supabase/supabase-js"
import { Database, Json } from "./types/supabase"
import {
	CachedLimit,
	CachedScript,
	OnlineUsers,
	Script,
	ScriptStats,
	StatsPayload
} from "./types/collection"
import bcrypt from "bcryptjs"

export const CACHE_TIMEOUT = 2 * 60 * 1000

const supabase = createClient<Database>(process.env.SB_URL, process.env.SERVICE_KEY, {
	auth: { autoRefreshToken: true, persistSession: false }
})

const scripts: Map<string, CachedScript> = new Map()
const limits: Map<string, CachedLimit> = new Map()

async function getPassword(id: string) {
	const { data, error } = await supabase.from("stats").select("password").eq("id", id).single()
	if (error)
		return {
			password: null,
			error: "⚠️ SELECT stats error, maybe user doesn't exist: " + JSON.stringify(error)
		}
	return { password: data.password, error: null }
}

export async function hashPassword(password: string | null | undefined) {
	if (password == null) return ""
	return await bcrypt.hash(password, 10)
}

export async function checkPassword(id: string, password: string) {
	const { password: stored, error } = await getPassword(id)
	if (!stored || error) return { status: 403, error }
	if (stored === "" && password === "") return { status: 200, error }

	if (await bcrypt.compare(password, stored)) return { status: 200, error }
	return { status: 401, error: "⚠️ Wrong password." }
}

async function comparePasswords(
	password1: string | null | undefined,
	password2: string | null | undefined
) {
	if (password1 == null || password1 === "") return true
	if (password1 === "" && password2 === "") return true
	if (password2 == null) return false

	return await bcrypt.compare(password2, password1)
}

export async function updatePassword(id: string, old: string, password: string) {
	const oldData = await getPassword(id)
	if (!oldData.password) return { status: 403, error: oldData.error ?? "⚠️ Unknown server error!" }

	const promises = await Promise.all([
		comparePasswords(oldData.password, old),
		hashPassword(password)
	])

	if (!promises[0]) return { status: 409, error: "❌ Wrong password!" }
	const { error } = await supabase.from("stats").update({ password: promises[1] }).eq("id", id)

	if (error) return { status: 501, error: "⚠️ UPDATE stats error: " + JSON.stringify(error) }

	return { status: 200, error: null }
}

export async function getScript(id: string) {
	const now = Date.now()
	const cached = scripts.get(id)

	if (cached && now - cached.timestamp < CACHE_TIMEOUT) {
		return { script: cached.script, status: 200, error: null }
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.select("id, title, protected (revision, username)")
		.eq("id", id)
		.single<Script>()

	if (error)
		return {
			script: null,
			status: 404,
			error: "⚠️ SELECT scripts.scripts error: " + JSON.stringify(error)
		}

	scripts.set(id, { script: data, timestamp: now })
	return { script: data, status: 200, error: null }
}

export async function getLimits(id: string) {
	const now = Date.now()
	const cached = limits.get(id)
	if (cached && now - cached.timestamp < CACHE_TIMEOUT) {
		return { limit: cached.limit, status: 200, error: null }
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.select("min_xp, max_xp, min_gp, max_gp")
		.eq("id", id)
		.limit(1)
		.single()

	if (error)
		return {
			limit: null,
			status: 404,
			error: "⚠️ SELECT scripts.scripts error: " + JSON.stringify(error)
		}

	limits.set(id, { limit: data, timestamp: now })
	return { limit: data, status: 200, error: null }
}

export async function getRoles(id: string) {
	return await supabase
		.schema("profiles")
		.from("profiles")
		.select("id, roles (administrator, moderator, premium, scripter, tester, timeout, vip)")
		.eq("discord", id)
		.single()
}

export async function updateRoles(id: string, roles: string[]) {
	const { data: profile, error: profileErr } = await getRoles(id)

	if (profileErr) return { status: 404, error: "User not found: " + JSON.stringify(profileErr) }

	const roleObject = {
		moderator: roles.includes("1018906735123124315"),
		scripter: roles.includes("1069140447647240254"),
		tester: roles.includes("907209408860291113"),
		timeout: roles.includes("1102052216157786192")
	}

	const { error: updateError } = await supabase
		.schema("profiles")
		.from("roles")
		.update(roleObject)
		.eq("id", profile.id)

	if (updateError) return { status: 500, error: "User not found: " + JSON.stringify(profileErr) }

	return { status: 200, error: null }
}

export async function getStats(id: string) {
	const { data, error } = await supabase
		.from("stats")
		.select("experience, gold, runtime")
		.eq("id", id)
		.single()

	if (error) return { stats: null, status: 404, error: JSON.stringify(error) }

	return { stats: data, status: 200, error: null }
}

export async function getStatsEx(id: string) {
	const { data } = await supabase
		.from("stats")
		.select("experience, gold, runtime, password")
		.eq("id", id)
		.single()

	return data
}

async function getScriptStats(id: string) {
	const { data, error } = await supabase
		.schema("scripts")
		.from("stats_simba")
		.select("experience, gold, runtime, unique_users, online_users")
		.eq("id", id)
		.limit(1)
		.single()

	if (error) {
		return { script: null, error: "SELECT scripts.stats_simba error: " + JSON.stringify(error) }
	}

	return { script: data, error: null }
}

async function updateScriptStats(payload: ScriptStats) {
	const old = await getScriptStats(payload.id)
	if (!old || old.error || !old.script)
		return {
			status: 206,
			error:
				(old?.error ?? "Unexpected error when updating script stats.") + " User stats were updated!"
		}

	const t = Date.now()

	const scriptStats = {
		experience: payload.experience + old.script.experience,
		gold: payload.gold + old.script.gold,
		runtime: payload.runtime + old.script.runtime,
		unique_users: old.script.unique_users,
		online_users: old.script.online_users as unknown as OnlineUsers[]
	}

	const user_id = payload.user_id.toLocaleLowerCase()
	const user = { id: user_id, time: t } as Json
	const onlineUsers: Json[] = []

	let found = false
	for (let i = 0; i < scriptStats.online_users.length; i++) {
		if (scriptStats.online_users[i].id === user) {
			onlineUsers.push(user)
			found = true
			continue
		}

		if (scriptStats.online_users[i].time + 3000 > t)
			onlineUsers.push({
				id: scriptStats.online_users[i].id,
				time: scriptStats.online_users[i].time
			})
	}

	if (!found) onlineUsers.push(user)

	const { error } = await supabase
		.schema("scripts")
		.from("stats_simba")
		.update({
			experience: scriptStats.experience,
			gold: scriptStats.gold,
			runtime: scriptStats.runtime,
			unique_users: scriptStats.unique_users,
			online_users: onlineUsers
		})
		.eq("id", payload.id)

	if (error) {
		return {
			status: 206,
			error:
				"⚠️ UPDATE scripts.stats_simba with payload: " +
				JSON.stringify(payload) +
				"gave the following error: " +
				JSON.stringify(error)
		}
	}

	return { status: 200, error: null }
}

export async function upsertStats(id: string, statsPayload: StatsPayload) {
	const promises = await Promise.all([getStatsEx(id), getLimits(statsPayload.script_id)])

	const old = promises[0]
	const { limit, error, status } = promises[1]

	if (!limit || error) {
		return {
			status,
			error: error ?? "Unexpected error returning script limits."
		}
	}

	if (statsPayload.experience < limit.min_xp || statsPayload.experience > limit.max_xp) {
		return { status: 403, error: "Reported experience is not within the script aproved limits!" }
	}

	if (statsPayload.gold < limit.min_gp || statsPayload.gold > limit.max_gp) {
		return { status: 403, error: "Reported gold is not within the script aproved limits!" }
	}

	if (statsPayload.runtime === 0) statsPayload.runtime = 5000
	if (statsPayload.runtime < 1000 || statsPayload.runtime > 15 * 60 * 1000) {
		return { status: 403, error: "Reported runtime is not within the aproved limits!" }
	}

	if (statsPayload.experience === 0 && statsPayload.gold === 0) {
		return { status: 403, error: "No experience nor gold was reported!" }
	}

	const scriptStats = {
		id: statsPayload.script_id,
		user_id: id,
		experience: statsPayload.experience,
		gold: statsPayload.gold,
		runtime: statsPayload.runtime
	}

	console.log(
		`User: ${id} Script:  ${statsPayload.script_id} XP:  ${statsPayload.experience} GP:  ${statsPayload.gold} Runtime:  ${statsPayload.runtime}`
	)

	let userStats

	let errUser: PostgrestError | null
	if (!old) {
		userStats = {
			id: id,
			experience: statsPayload.experience,
			gold: statsPayload.gold,
			runtime: statsPayload.runtime,
			password: await hashPassword(statsPayload.password)
		}

		const { error } = await supabase.from("stats").insert(userStats)
		errUser = error
	} else {
		const validPassword = await comparePasswords(old.password, statsPayload.password)
		if (!validPassword) return { status: 401, error: "⚠️ Wrong password." }

		console.log(`Old xp: ${old.experience} Old gp: ${old.gold} Old runtime: ${old.runtime}`)
		userStats = {
			experience: statsPayload.experience + old.experience,
			gold: statsPayload.gold + old.gold,
			runtime: statsPayload.runtime + old.runtime
		}
		console.log(
			`New xp: ${userStats.experience} New gp: ${userStats.gold} New runtime: ${userStats.runtime}`
		)

		const { error } = await supabase.from("stats").update(userStats).eq("id", id)
		errUser = error
	}

	if (errUser) {
		return {
			status: 500,
			error:
				"UPDATE stats data: " +
				JSON.stringify(userStats) +
				" gave the following error: " +
				JSON.stringify(errUser)
		}
	}

	return await updateScriptStats(scriptStats)
}

export async function deleteUser(id: string, password: string) {
	const { status, error: err } = await checkPassword(id, password)
	if (status !== 200) return { status, error: err ?? "⚠️ Unexpected server error!" }

	const { error } = await supabase.from("stats").delete().eq("id", id)
	if (error)
		return { status: 501, error: "⚠️ DELETE stats id: " + id + " failed: " + JSON.stringify(error) }

	return { status: 200, error: null }
}
