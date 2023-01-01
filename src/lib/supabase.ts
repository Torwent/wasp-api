import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import env from "./env"
import { Payload, RawPayload, StatsEntry, StatsScriptEntry } from "$lib/types"

const options = { auth: { autoRefreshToken: true, persistSession: false } }
const supabase = createClient(env.SB_URL, env.SB_ANON_KEY, options)

const login = async () => {
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

const logout = async () => await supabase.auth.signOut()

export const getScriptData = async (id: string) => {
  if (!(await login())) return console.error("Couldn't login to the database!")

  const { data, error } = await supabase
    .from("stats_scripts_protected")
    .select("xp_req_limit, gp_req_limit")
    .eq("id", id)

  if (error) return console.error(error)

  return data[0] as StatsScriptEntry
}

export const getData = async (biohash: number) => {
  if (!(await login())) return console.error("Couldn't login to the database!")

  const { data, error } = await supabase
    .from("stats_protected")
    .select()
    .eq("biohash", biohash)

  if (error) return console.error(error)

  return data[0] as StatsEntry
}

export const hashPassword = async (password: string | null | undefined) => {
  if (password == null) return ""
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (
  biohash: number,
  password: string | null | undefined
) => {
  const data = await getData(biohash)
  if (data == null) return true

  const storedHash = data.password
  if (storedHash == null || storedHash === "") return true
  if (storedHash === "" && password === "") return true

  if (password == null) return false

  return await bcrypt.compare(password, storedHash)
}

async function sanitizePayload(
  rawPayload: RawPayload
): Promise<number | Payload> {
  if (rawPayload.script_id == null) return 401

  const scriptLimits = await getScriptData(rawPayload.script_id)
  if (scriptLimits == null) return 402

  if (rawPayload.experience == null) rawPayload.experience = 0
  rawPayload.experience = Number(rawPayload.experience)
  if (rawPayload.experience > scriptLimits.xp_req_limit) return 403

  if (rawPayload.gold == null) rawPayload.gold = 0
  rawPayload.gold = Number(rawPayload.gold)
  if (rawPayload.gold > scriptLimits.gp_req_limit) return 404

  if (rawPayload.runtime == null) rawPayload.runtime = 5000
  rawPayload.runtime = Number(rawPayload.runtime)
  if (rawPayload.runtime <= 1000) return 405
  if (rawPayload.runtime >= 15 * 60 * 1000) return 406

  if (rawPayload.levels == null) rawPayload.levels = 0
  rawPayload.levels = Number(rawPayload.levels)

  if (rawPayload.banned == null) rawPayload.banned = false
  rawPayload.banned = false

  return rawPayload as Payload
}

export const upsertData = async (biohash: number, rawPayload: RawPayload) => {
  if (!(await login())) return 500
  if (!(await comparePassword(biohash, rawPayload.password))) return 400

  let payload = await sanitizePayload(rawPayload)

  if (Number.isInteger(payload)) return payload as number
  payload = payload as Payload

  const statsEntry: StatsEntry = {
    biohash: biohash,
    experience: payload.experience,
    gold: payload.gold,
    runtime: payload.runtime,
    levels: payload.levels,
    banned: payload.banned,
  }

  if (rawPayload.username) statsEntry.username = rawPayload.username
  const oldData = await getData(biohash)

  if (!oldData) {
    if (rawPayload.password != null)
      statsEntry.password = await hashPassword(rawPayload.password)
    const { error } = await supabase.from("stats_protected").insert(statsEntry)
    if (error) {
      return 501
    }

    return 201
  }

  if (oldData.banned && statsEntry.banned) return 407

  statsEntry.experience += oldData.experience
  statsEntry.gold += oldData.gold
  statsEntry.runtime += oldData.runtime
  statsEntry.levels += oldData.levels

  const { error } = await supabase
    .from("stats_protected")
    .update(statsEntry)
    .eq("biohash", biohash)

  if (error) {
    return 502
  }

  return 202
}

export const updatePassword = async (
  biohash: number,
  password: string,
  new_password: string
) => {
  if (!(await login())) return 500

  if (!(await comparePassword(biohash, password))) return 409

  const oldData = await getData(biohash)

  if (!oldData) return 401

  new_password = await hashPassword(new_password)
  if (new_password == null) return 417

  const { error } = await supabase
    .from("stats_protected")
    .update({ password: new_password })
    .eq("biohash", biohash)

  if (error) {
    console.error(error)
    return 501
  }

  return 202
}
