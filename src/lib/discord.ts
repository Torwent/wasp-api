import env from "./env"
import { Client, GatewayIntentBits, Guild, GuildMember } from "discord.js"
import { updateProfileProtected } from "./supabase"

const DISCORD_TOKEN = env.DISCORD_TOKEN
const DISCORD_SERVER = "795071177475227709"
let guild: Guild | null

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

client.login(DISCORD_TOKEN)

const clientReady = new Promise<void>((resolve, reject) => {
  client.once("error", reject)
  client.once("ready", () => {
    client.off("error", reject)
    console.log(`Wasp Bot is online!`)
    resolve()
  })
})

export async function CheckDiscord(userID: string): Promise<string[]> {
  if (!client.isReady()) await clientReady
  if (userID == null) return []
  if (guild == null) {
    guild = client.guilds.resolve(DISCORD_SERVER)
    if (guild == null) return []
  }

  let member: GuildMember | null
  try {
    member = await guild.members.fetch(userID)
  } catch (error) {
    console.error("Unknown user!")
    member = null
  }

  if (member == null) return []

  const roles = member.roles.cache.map((role: { toString: () => any }) =>
    role.toString().replace(/[\<\@\&\>]/gi, "")
  )
  return roles
}

export async function RefreshDiscord(
  userID: string
): Promise<500 | 501 | 416 | 417 | 200> {
  if (!client.isReady()) await clientReady
  if (userID == null) return 416
  if (guild == null) {
    guild = client.guilds.resolve(DISCORD_SERVER)
    if (guild == null) return 501
  }

  let member: GuildMember | null
  try {
    member = await guild.members.fetch(userID)
  } catch (error) {
    console.error("Unknown user!")
    member = null
  }

  if (member == null) {
    await updateProfileProtected(userID, [])
    return 417
  }

  const roles = member.roles.cache.map((role: { toString: () => any }) =>
    role.toString().replace(/[\<\@\&\>]/gi, "")
  )

  return await updateProfileProtected(userID, roles)
}
