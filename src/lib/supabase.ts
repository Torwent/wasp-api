import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "./env"
import {
  Payload,
  RawPayload,
  ScriptEntry,
  UserEntry,
  ScriptData,
  ScriptLimits,
} from "$lib/types"

const OPTIONS = { auth: { autoRefreshToken: true, persistSession: false } }
const SUPABASE = createClient(env.SB_URL, env.SB_ANON_KEY, OPTIONS)
const CREDENTALS = {
  email: env.SERVICE_USER,
  password: env.SERVICE_PASS,
}

let isLoggedIn: boolean = false //login cache.

async function login(cacheOnly: boolean = true) {
  if (isLoggedIn && cacheOnly) {
    login(false) //make a full async, this should relog if needed.
    return true
  }

  const { data, error } = await SUPABASE.auth.getSession()

  if (error) {
    isLoggedIn = false
    console.error(error)
    return false
  }

  if (data.session == null) {
    console.log("Logging in as service user!")
    const { error } = await SUPABASE.auth.signInWithPassword(CREDENTALS)
    if (error) {
      isLoggedIn = false
      console.error(error)
      return false
    }
  }

  if (!isLoggedIn) isLoggedIn = true
  return true
}

let scriptLimitsArray: ScriptLimits[] = [] //script limits cache for blazing fast execution!

async function getScriptLimits(script_id: string, cacheOnly = true) {
  const index = scriptLimitsArray.findIndex((script) => script.id === script_id)
  if (cacheOnly) {
    if (index != -1) {
      getScriptLimits(script_id, false) //make a full async, this will update our cache.
      return scriptLimitsArray[index]
    }
  }

  const { data, error } = await SUPABASE.from("scripts_public")
    .select("min_xp, max_xp, min_gp, max_gp")
    .eq("id", script_id)

  if (error) return console.error(error)

  const scriptLimit: ScriptLimits = {
    id: script_id,
    min_xp: data[0].min_xp,
    max_xp: data[0].max_xp,
    min_gp: data[0].min_gp,
    max_gp: data[0].max_gp,
  }

  if (index === -1) scriptLimitsArray.push(scriptLimit)
  else scriptLimitsArray[index] = scriptLimit
  return scriptLimit
}

export async function getScriptEntry(script_id: string) {
  const { data, error } = await SUPABASE.from("stats_scripts")
    .select("experience, gold, runtime, unique_users, current_users")
    .eq("script_id", script_id)

  if (error) return console.error(error)

  return data[0] as ScriptEntry
}

export async function getUserData(userID: string) {
  const { data, error } = await SUPABASE.from("stats")
    .select("password, experience, gold, runtime")
    .eq("userID", userID)

  if (error) return console.error(error)

  return data[0] as UserEntry
}

export async function hashPassword(password: string | null | undefined) {
  if (password == null) return ""
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  uuid: string,
  password: string | null | undefined
) {
  const data = await getUserData(uuid)
  if (data == null) return 400

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

async function sanitizePayload(
  rawPayload: RawPayload
): Promise<number | Payload> {
  if (rawPayload.script_id == null) return 401

  const results = await Promise.all([
    getScriptLimits(rawPayload.script_id),
    parseNumber(rawPayload.experience),
    parseNumber(rawPayload.gold),
    parseNumber(rawPayload.runtime),
  ])

  const scriptLimits = results[0]
  rawPayload.experience = results[1]
  rawPayload.gold = results[2]
  rawPayload.runtime = results[3]

  if (scriptLimits == null) return 402
  if (rawPayload.experience < scriptLimits.min_xp) return 403
  if (rawPayload.experience > scriptLimits.max_xp) return 404
  if (rawPayload.gold < scriptLimits.min_gp) return 405
  if (rawPayload.gold > scriptLimits.max_gp) return 406

  if (rawPayload.runtime === 0) rawPayload.runtime = 5000
  if (rawPayload.runtime <= 1000) return 407
  if (rawPayload.runtime >= 15 * 60 * 1000) return 408

  return rawPayload as Payload
}

async function updateScriptData(script_id: string, payload: UserEntry) {
  const oldData = await getScriptEntry(script_id)
  if (oldData == null) return

  const t = Date.now()

  const entry: ScriptEntry = {
    experience: payload.experience + oldData.experience,
    gold: payload.gold + oldData.gold,
    runtime: payload.runtime + oldData.runtime,
    unique_users: oldData.unique_users,
    current_users: oldData.current_users.filter((user) => {
      return user.timestamp + 300000 > t
    }),
  }

  if (payload.userID != null) {
    let id = payload.userID.toLocaleLowerCase()

    if (!entry.unique_users.includes(id)) entry.unique_users.push(id)

    let foundUser = false
    entry.current_users.forEach((user, index, arr) => {
      foundUser = user.id === id
      if (foundUser) {
        arr[index].timestamp = t
        return
      }
    })
    if (!foundUser) entry.current_users.push({ id: id, timestamp: t })
  }
  const { error } = await SUPABASE.from("stats_scripts")
    .update(entry)
    .eq("script_id", script_id)

  if (error) console.error(error)
}

export async function upsertPlayerData(userID: string, rawPayload: RawPayload) {
  if (!isLoggedIn) {
    await login(false)
    if (!isLoggedIn) return 500
  }

  const oldData = await getUserData(userID)

  if (oldData != null) {
    const validPassword = await comparePasswordFast(
      oldData.password,
      rawPayload.password
    )

    if (!validPassword) return 400
  }

  let payload = await sanitizePayload(rawPayload)

  if (Number.isInteger(payload)) return payload as number
  payload = payload as Payload

  const entry: UserEntry = {
    userID: userID,
    username: payload.username,
    experience: payload.experience,
    gold: payload.gold,
    runtime: payload.runtime,
  }

  if (rawPayload.username) entry.username = rawPayload.username

  if (!oldData) {
    if (rawPayload.password != null)
      entry.password = await hashPassword(rawPayload.password)

    const { error } = await SUPABASE.from("stats").insert(entry)
    if (error) {
      console.error(error)
      return 501
    }

    if (rawPayload.script_id != null)
      updateScriptData(rawPayload.script_id, entry)

    return 201
  }

  entry.experience += oldData.experience
  entry.gold += oldData.gold
  entry.runtime += oldData.runtime

  const { error } = await SUPABASE.from("stats")
    .update(entry)
    .eq("userID", userID)

  if (error) {
    console.error(error)
    return 502
  }
  let userEntry: UserEntry = {
    userID: userID,
    experience: payload.experience,
    gold: payload.gold,
    runtime: payload.runtime,
  }
  updateScriptData(payload.script_id, userEntry)
  return 202
}

export async function updatePassword(
  uuid: string,
  password: string,
  new_password: string
) {
  if (!(await login())) return 500
  const oldData = await getUserData(uuid)
  if (!oldData) return 401

  const results = await Promise.all([
    comparePasswordFast(oldData.password, password),
    hashPassword(new_password),
  ])

  if (!results[0]) return 409
  new_password = results[1]
  if (new_password == null) return 417

  const { error } = await SUPABASE.from("stats")
    .update({ password: new_password })
    .eq("userID", uuid)

  if (error) {
    console.error(error)
    return 501
  }

  return 202
}

export async function deleteData(userID: string, password: string) {
  if (!(await login())) return 500
  if (!(await comparePassword(userID, password))) return 400

  const { error } = await SUPABASE.from("stats").delete().eq("uuid", userID)

  if (error) return 501

  return 200
}

let scriptDataArray: ScriptData[] = []

export async function getScriptData(id: string, cacheOnly = true) {
  const index = scriptDataArray.findIndex((script) => script.id === id)
  if (cacheOnly) {
    if (index != -1) {
      getScriptData(id, false) //make a full async, this will update our cache.
      return scriptDataArray[index]
    }
  }

  const publicData = SUPABASE.from("scripts_public")
    .select("title")
    .eq("id", id)
  const protectedData = SUPABASE.from("scripts_protected")
    .select("author, revision")
    .eq("id", id)

  const promises = await Promise.all([publicData, protectedData])

  if (promises[0].error) {
    console.error(promises[0].error)
    return
  }

  if (promises[1].error) {
    console.error(promises[1].error)
    return
  }

  const dataPublic = promises[0].data[0]
  const dataProtected = promises[1].data[0]

  if (dataPublic == null || dataProtected == null) return

  const script: ScriptData = {
    id: id,
    title: dataPublic.title,
    author: dataProtected.author,
    revision: dataProtected.revision,
  }

  if (index === -1) scriptDataArray.push(script)
  else scriptDataArray[index] = script

  return script
}

export async function updateProfileProtected(
  discord_id: string,
  roles: string[]
) {
  if (!isLoggedIn) {
    await login(false)
    if (!isLoggedIn) return 500
  }

  const { error } = await SUPABASE.rpc("set_discord_roles", {
    discord_id: discord_id,
    param_developer: roles.includes("864744526894333963"),
    param_premium: roles.includes("820985772140134440"),
    param_vip: roles.includes("931167526681972746"),
    param_tester: roles.includes("907209408860291113"),
    param_mod: roles.includes("1018906735123124315"),
  })

  if (error) return 417
  return 200
}
