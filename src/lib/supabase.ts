import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "./env"
import {
  Payload,
  RawPayload,
  ScriptEntry,
  UserEntry,
  RawScriptEntry,
  ScriptData,
} from "$lib/types"

const options = { auth: { autoRefreshToken: true, persistSession: false } }
const supabase = createClient(env.SB_URL, env.SB_ANON_KEY, options)

async function login() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error(error)
    return false
  }

  if (data.session == null) {
    const { error } = await supabase.auth.signInWithPassword({
      email: env.SERVICE_USER,
      password: env.SERVICE_PASS,
    })
    if (error) {
      console.error(error)
      return false
    }
  }

  return true
}

export async function getScriptData(script_id: string) {
  const { data, error } = await supabase
    .from("stats_scripts")
    .select("min_xp, max_xp, min_gp, max_gp")
    .eq("script_id", script_id)

  if (error) return console.error(error)

  return data[0] as RawScriptEntry
}

export async function getScriptEntry(script_id: string) {
  const { data, error } = await supabase
    .from("stats_scripts")
    .select("experience, gold, runtime")
    .eq("script_id", script_id)

  if (error) return console.error(error)

  return data[0] as ScriptEntry
}

export async function getUserData(userID: string) {
  const { data, error } = await supabase
    .from("stats")
    .select()
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
  if (data == null) return true

  const storedHash = data.password
  if (storedHash == null || storedHash === "") return true
  if (storedHash === "" && password === "") return true

  if (password == null) return false

  return bcrypt.compare(password, storedHash)
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
    getScriptData(rawPayload.script_id),
    parseNumber(rawPayload.experience),
    parseNumber(rawPayload.gold),
  ])

  const scriptLimits = results[0]
  rawPayload.experience = results[1]
  rawPayload.gold = results[2]

  if (scriptLimits == null) return 402
  if (rawPayload.experience < scriptLimits.min_xp) return 403
  if (rawPayload.experience > scriptLimits.max_xp) return 404
  if (rawPayload.gold < scriptLimits.min_gp) return 405
  if (rawPayload.gold > scriptLimits.max_gp) return 406

  if (rawPayload.runtime == null) rawPayload.runtime = 5000
  rawPayload.runtime = Number(rawPayload.runtime)
  if (rawPayload.runtime <= 1000) return 407
  if (rawPayload.runtime >= 15 * 60 * 1000) return 408

  return rawPayload as Payload
}

const not_gp_scripts = ["d367e87f-da39-46ac-89df-f5b80f79d8a5", "b97a7bdf-4d8b-4cfb-ae20-736a5f238c1e"]

async function updateScriptData(script_id: string, payload: UserEntry) {
  const oldData = await getScriptEntry(script_id)
  if (oldData == null) return

  const entry: ScriptEntry = {
    experience: payload.experience + oldData.experience,
    gold: payload.gold + oldData.gold,
    runtime: payload.runtime + oldData.runtime,
  }


  if (not_gp_scripts.includes(script_id)) {
    if (payload.gold > 0) console.log("payload:", payload)
  }

  const { error } = await supabase
    .from("stats_scripts")
    .update(entry)
    .eq("script_id", script_id)

  if (error) console.error(error)
}

export async function upsertPlayerData(userID: string, rawPayload: RawPayload) {
  if (!(await login())) return 500

  const oldData = await getUserData(userID)
  if (oldData != null)
    if (!(await comparePasswordFast(oldData.password, rawPayload.password)))
      return 400

  let payload = await sanitizePayload(rawPayload)

  if (Number.isInteger(payload)) return payload as number
  payload = payload as Payload

  
  if (not_gp_scripts.includes(payload.script_id)) {
    if (payload.gold > 0) console.log("payload:", payload)
  }

  
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

    const { error } = await supabase.from("stats").insert(entry)
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

  const { error } = await supabase
    .from("stats")
    .update(entry)
    .eq("userID", userID)

  if (error) {
    console.error(error)
    return 502
  }

  updateScriptData(payload.script_id, entry)
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
    supabase.from("stats").update({ password: new_password }).eq("uuid", uuid),
  ])

  if (!results[0]) return 409
  new_password = results[1]
  if (new_password == null) return 417

  const { error } = results[2]

  if (error) {
    console.error(error)
    return 501
  }

  return 202
}

export async function deleteData(userID: string, password: string) {
  if (!(await login())) return 500
  if (!(await comparePassword(userID, password))) return 400

  const { error } = await supabase.from("stats").delete().eq("uuid", userID)

  if (error) return 501

  return 200
}


export async function getFullScriptData(id: string) {

  const publicData = supabase.from("scripts_public").select().eq("id", id)
  const protectedData = supabase.from("scripts_protected").select().eq("id", id)

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
    revision: dataProtected.revision
  }

  return script
}

export async function getScriptRevision(id: string) {

  const {data, error} = await supabase.from("scripts_protected").select("revision").eq("id", id)

  if (error) {
    console.error(error)
    return
  }

  if (data[0] == null) return

  return data[0] as ScriptData
}