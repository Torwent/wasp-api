import env from "./env"
import { Client, GatewayIntentBits, Guild, GuildMember } from "discord.js"
import { getProfileProtected, updateProfileProtected } from "./supabase"

const DISCORD_TOKEN = env.DISCORD_TOKEN
const DISCORD_SERVER = "795071177475227709"
const ROLES = {
	administrator: "816271648118013953",
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113",
	vip: "931167526681972746",
	premium: "820985772140134440",
	timeout: "1102052216157786192"
}

let guild: Guild | null

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
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
		role.toString().replace(/[<@&>]/gi, "")
	)
	return roles
}

export async function RefreshDiscord(userID: string): Promise<500 | 501 | 416 | 417 | 200> {
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
		role.toString().replace(/[<@&>]/gi, "")
	)

	return await updateProfileProtected(userID, roles)
}

export async function updateDiscord(userID: string): Promise<500 | 501 | 416 | 417 | 200> {
	if (!client.isReady()) await clientReady
	if (userID == null) return 416
	if (guild == null) {
		guild = client.guilds.resolve(DISCORD_SERVER)
		if (guild == null) return 501
	}

	const member = await guild.members.fetch(userID).catch(() => {
		console.error("Unknown user!")
		return null
	})

	if (member == null) return 417

	const profile = await getProfileProtected(userID)

	if (profile === 417 || profile === 500) return profile

	const { roles } = profile

	let property: keyof typeof roles

	for (property in roles) {
		if (Object.keys(ROLES).includes(property)) {
			const rolesKey = property as keyof typeof ROLES

			if (property !== "administrator") {
				if (roles[property]) await member.roles.add(ROLES[rolesKey])
				else await member.roles.remove(ROLES[rolesKey])
			}
		}
	}
	return 200
}
