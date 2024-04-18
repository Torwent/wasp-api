import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "./env"
import {
	Payload,
	Profile,
	RawPayload,
	Script,
	ScriptEntry,
	ScriptLimits,
	Stats,
	UserEntry
} from "./types/collection"
import { Database, Json } from "./types/supabase"

const OPTIONS = { auth: { autoRefreshToken: true, persistSession: false } }
const supabase = createClient<Database>(env.SB_URL, env.SERVICE_KEY, OPTIONS)

const scriptLimitsArray: ScriptLimits[] = [] //script limits cache for blazing fast execution!

async function getScriptLimits(script_id: string, cacheOnly = true) {
	let index = -1

	for (let i = 0; i < scriptLimitsArray.length; i++) {
		if (scriptLimitsArray[i].id === script_id) {
			index = i
			break
		}
	}

	if (cacheOnly) {
		if (index != -1) {
			getScriptLimits(script_id, false) //make a full async, this will update our cache.
			return scriptLimitsArray[index]
		}
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.select("id, min_xp, max_xp, min_gp, max_gp")
		.eq("id", script_id)
		.limit(1)
		.returns<ScriptLimits[]>()

	if (error) return console.error("SELECT scripts.scripts error: " + JSON.stringify(error))

	if (index === -1) scriptLimitsArray.push(data[0])
	else scriptLimitsArray[index] = data[0]
	return data[0]
}

export async function getScriptEntry(script_id: string) {
	const { data, error } = await supabase
		.schema("scripts")
		.from("stats_simba")
		.select("experience, gold, runtime, unique_users, online_users")
		.eq("id", script_id)
		.limit(1)
		.returns<ScriptEntry[]>()

	if (error) return console.error("SELECT scripts.stats_simba error: " + JSON.stringify(error))

	return data[0]
}

export async function getUserData(id: string) {
	const { data, error } = await supabase
		.from("stats")
		.select("password, experience, gold, runtime")
		.eq("id", id)

	if (error) return console.error("SELECT stats error: " + JSON.stringify(error))

	return data[0] as UserEntry
}

export async function hashPassword(password: string | null | undefined) {
	if (password == null) return ""
	return bcrypt.hash(password, 10)
}

export async function comparePassword(uuid: string, password: string | null | undefined) {
	const data = await getUserData(uuid)
	if (!data) return 400

	const storedHash = data.password
	if (storedHash == null || storedHash === "") return 201
	if (storedHash === "" && password === "") return 200

	if (password == null) return 401

	if (await bcrypt.compare(password, storedHash)) return 200
	return 401
}

export async function comparePasswordFast(
	currentPassword: string | null | undefined,
	newPassword: string | null | undefined
) {
	if (currentPassword == null || currentPassword === "") return true
	if (currentPassword === "" && newPassword === "") return true

	if (newPassword == null) return false

	return bcrypt.compare(newPassword, currentPassword)
}

async function parseNumber(n: any) {
	if (n == null) n = 0
	return Number(n)
}

async function sanitizePayload(rawPayload: RawPayload): Promise<number | Payload> {
	if (rawPayload.script_id == null) return 401

	const results = await Promise.all([
		getScriptLimits(rawPayload.script_id),
		parseNumber(rawPayload.experience),
		parseNumber(rawPayload.gold),
		parseNumber(rawPayload.runtime)
	])

	const scriptLimits = results[0]
	rawPayload.experience = results[1]
	rawPayload.gold = results[2]
	rawPayload.runtime = results[3]

	if (!scriptLimits) return 402
	if (rawPayload.experience < scriptLimits.min_xp) return 403
	if (rawPayload.experience > scriptLimits.max_xp) return 404
	if (rawPayload.gold < scriptLimits.min_gp) return 405
	if (rawPayload.gold > scriptLimits.max_gp) return 406

	if (rawPayload.runtime === 0) rawPayload.runtime = 5000
	if (rawPayload.runtime <= 1000) return 407
	if (rawPayload.runtime >= 15 * 60 * 1000) return 408
	if (rawPayload.gold === 0 && rawPayload.experience === 0) return 409

	return rawPayload as Payload
}

async function updateScriptData(script_id: string, payload: Stats) {
	const oldData = await getScriptEntry(script_id)
	if (!oldData) return

	const t = Date.now()

	const entry = {
		experience: (payload.experience ?? 0) + oldData.experience,
		gold: (payload.gold ?? 0) + oldData.gold,
		runtime: (payload.runtime ?? 0) + oldData.runtime,
		unique_users: oldData.unique_users,
		online_users: oldData.online_users.filter((user) => {
			if (user) return user.time + 300000 > t
		})
	}

	if (payload.id) {
		const id = payload.id.toLocaleLowerCase()

		if (!entry.unique_users.includes(id)) entry.unique_users.push(id)

		if (entry.online_users.length === 0) {
			entry.online_users.push({ id: id, time: t })
		} else {
			for (let i = 0; i < entry.online_users.length; i++) {
				if (entry.online_users[i].id.toLowerCase() === id) {
					entry.online_users[i].time = t
					break
				}

				if (i === entry.online_users.length - 1) entry.online_users.push({ id: id, time: t })
			}
		}
	}

	const { error } = await supabase
		.schema("scripts")
		.from("stats_simba")
		.update({
			experience: entry.experience,
			gold: entry.gold,
			runtime: entry.runtime,
			unique_users: entry.unique_users,
			online_users: entry.online_users.map((user) => user as unknown as Json)
		})
		.eq("id", script_id)

	if (error) {
		error.message +=
			" error object: " +
			JSON.stringify({
				experience: entry.experience,
				gold: entry.gold,
				runtime: entry.runtime
			})
		console.error("UPDATE scripts.stats_simba error: " + JSON.stringify(error))
	}
}

export async function upsertPlayerData(id: string, rawPayload: RawPayload) {
	const oldData = await getUserData(id)

	if (oldData) {
		const validPassword = await comparePasswordFast(oldData.password, rawPayload.password)

		if (!validPassword) return 400
	}

	let payload = await sanitizePayload(rawPayload)

	if (Number.isInteger(payload)) return payload as number
	payload = payload as Payload

	const entry: Stats = {
		id: id,
		username: payload.username,
		experience: payload.experience,
		gold: payload.gold,
		runtime: payload.runtime,
		password: ""
	}

	if (rawPayload.username) entry.username = rawPayload.username

	if (!oldData) {
		if (rawPayload.password != null) entry.password = await hashPassword(rawPayload.password)

		const { error } = await supabase.from("stats").insert(entry)
		if (error) {
			console.error(
				"INSERT stats error: " + JSON.stringify(error) + " data: " + JSON.stringify(entry)
			)
			return 501
		}

		if (rawPayload.script_id) updateScriptData(rawPayload.script_id, entry)

		return 201
	}

	const { error } = await supabase
		.from("stats")
		.update({
			experience: (entry.experience ?? 0) + oldData.experience,
			gold: (entry.gold ?? 0) + oldData.gold,
			runtime: (entry.runtime ?? 0) + oldData.runtime
		})
		.eq("id", id)

	if (error) {
		error.message +=
			" object: " +
			JSON.stringify({
				experience: (entry.experience ?? 0) + oldData.experience,
				gold: (entry.gold ?? 0) + oldData.gold,
				runtime: (entry.runtime ?? 0) + oldData.runtime
			})
		console.error("UPDATE stats error: " + JSON.stringify(error))
		return 502
	}
	const userEntry: Stats = {
		id: id,
		experience: payload.experience,
		gold: payload.gold,
		runtime: payload.runtime,
		password: "",
		username: ""
	}
	updateScriptData(payload.script_id, userEntry)
	return 202
}

export async function updatePassword(uuid: string, password: string, new_password: string) {
	const oldData = await getUserData(uuid)
	if (!oldData) return 401

	const results = await Promise.all([
		comparePasswordFast(oldData.password, password),
		hashPassword(new_password)
	])

	if (!results[0]) return 409
	new_password = results[1]
	if (new_password == null) return 417

	const { error } = await supabase.from("stats").update({ password: new_password }).eq("id", uuid)

	if (error) {
		console.error("UPDATE stats error: " + JSON.stringify(error))
		return 501
	}

	return 202
}

export async function deleteData(id: string, password: string) {
	if (!(await comparePassword(id, password))) return 400

	const { error } = await supabase.from("stats").delete().eq("uuid", id)

	if (error) return 501

	return 200
}

const scriptDataArray: Script[] = []

export async function getScriptData(id: string, cacheOnly = true) {
	const index = scriptDataArray.findIndex((script) => script.id === id)
	if (cacheOnly) {
		if (index != -1) {
			getScriptData(id, false) //make a full async, this will update our cache.
			return scriptDataArray[index]
		}
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.select("id, title, protected (revision, username)")
		.eq("id", id)
		.limit(1)
		.returns<Script[]>()

	if (error) return console.error("SELECT scripts.scripts error: " + JSON.stringify(error))
	if (data.length === 0) return console.error("Script not found")

	if (index === -1) scriptDataArray.push(data[0])
	else scriptDataArray[index] = data[0]

	return data[0]
}

export async function getProfileProtected(discord_id: string) {
	const { data, error } = await supabase
		.schema("profiles")
		.from("profiles")
		.select("id, roles (*), subscriptions (external)")
		.eq("discord", discord_id)
		.limit(1)
		.returns<Profile[]>()

	if (error) {
		console.error("SELECT profiles.profiles error: " + JSON.stringify(error))
		return 417
	}

	return data[0]
}

export async function updateProfileProtected(discord_id: string, roles: string[]) {
	const profile = await getProfileProtected(discord_id)
	if (profile === 417) return profile

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

	if (updateError) {
		console.error("UPDATE profiles.roles error: " + JSON.stringify(updateError))
		return 417
	}
	return 200
}
