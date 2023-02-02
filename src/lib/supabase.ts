import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "./env"
import { Payload, RawPayload, StatsEntry, StatsScriptEntry } from "$lib/types"

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

async function logout() {
  await supabase.auth.signOut()
}

export async function getScriptData(id: string) {
  const { data, error } = await supabase
    .from("stats_scripts_protected")
    .select("min_xp, max_xp, min_gp, max_gp")
    .eq("id", id)

  if (error) return console.error(error)

  return data[0] as StatsScriptEntry
}

export async function getData(biohash: number) {
  const { data, error } = await supabase
    .from("stats_protected")
    .select()
    .eq("biohash", biohash)

  if (error) return console.error(error)

  return data[0] as StatsEntry
}

export async function hashPassword(password: string | null | undefined) {
  if (password == null) return ""
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  biohash: number,
  password: string | null | undefined
) {
  const data = await getData(biohash)
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

async function parseBoolean(value: any) {
  if (typeof value === "string") {
    if (value.toLowerCase() === "false") return false
    return true
  }
  if (value == null) return false
  return Boolean(value)
}

async function sanitizePayload(
  rawPayload: RawPayload
): Promise<number | Payload> {
  if (rawPayload.script_id == null) return 401

  const results = await Promise.all([
    getScriptData(rawPayload.script_id),
    parseNumber(rawPayload.experience),
    parseNumber(rawPayload.gold),
    parseBoolean(rawPayload.banned),
  ])

  const scriptLimits = results[0]
  rawPayload.experience = results[1]
  rawPayload.gold = results[2]
  rawPayload.banned = results[3]

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

export async function upsertData(biohash: number, rawPayload: RawPayload) {
  if (!(await login())) return 500

  const oldData = await getData(biohash)
  if (oldData != null)
    if (!(await comparePasswordFast(oldData.password, rawPayload.password)))
      return 400

  let payload = await sanitizePayload(rawPayload)

  if (Number.isInteger(payload)) return payload as number
  payload = payload as Payload

  const statsEntry: StatsEntry = {
    biohash: biohash,
    username: payload.username,
    experience: payload.experience,
    gold: payload.gold,
    runtime: payload.runtime,
    banned: payload.banned,
  }

  if (rawPayload.username) statsEntry.username = rawPayload.username

  if (!oldData) {
    if (rawPayload.password != null)
      statsEntry.password = await hashPassword(rawPayload.password)

    const { error } = await supabase.from("stats_protected").insert(statsEntry)
    if (error) return 501
    return 201
  }

  if (oldData.banned && statsEntry.banned) return 407

  statsEntry.experience += oldData.experience
  statsEntry.gold += oldData.gold
  statsEntry.runtime += oldData.runtime

  const { error } = await supabase
    .from("stats_protected")
    .update(statsEntry)
    .eq("biohash", biohash)

  if (error) return 502
  return 202
}

export async function updatePassword(
  biohash: number,
  password: string,
  new_password: string
) {
  if (!(await login())) return 500
  const oldData = await getData(biohash)
  if (!oldData) return 401

  const results = await Promise.all([
    comparePasswordFast(oldData.password, password),
    hashPassword(new_password),
    supabase
      .from("stats_protected")
      .update({ password: new_password })
      .eq("biohash", biohash),
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

export async function deleteData(biohash: number, password: string) {
  if (!(await login())) return 500
  if (!(await comparePassword(biohash, password))) return 400

  const { error } = await supabase
    .from("stats_protected")
    .delete()
    .eq("biohash", biohash)

  if (error) return 501

  return 200
}
