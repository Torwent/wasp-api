import { Client, GatewayIntentBits, Guild } from "discord.js"
import { getRoles, updateRoles } from "$lib/supabase"

const DISCORD_SERVER = "795071177475227709"
const ROLES = {
	administrator: "816271648118013953",
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113",
	timeout: "1102052216157786192"
}

let guild: Guild | null

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })
client.login(process.env.DISCORD_TOKEN)

const clientReady = new Promise<void>((resolve, reject) => {
	client.once("error", reject)
	client.once("ready", async () => {
		client.off("error", reject)
		console.log("🤖 Wasp Bot is online!")
		guild = client.guilds.resolve(DISCORD_SERVER)
	})
})

export async function checkDiscord(id: string) {
	if (!client.isReady()) await clientReady
	if (guild == null) return { data: [], status: 500, error: "Guild is NULL" }

	let member = await guild.members.fetch(id).catch((err) => null)
	if (member == null) return { data: [], status: 404, error: "Guild member does not exist" }

	const roles = member.roles.cache.map((role: { toString: () => any }) =>
		role.toString().replace(/[<@&>]/gi, "")
	)
	return { roles: roles, status: 200, error: null }
}

export async function refreshDiscord(id: string) {
	if (!client.isReady()) await clientReady
	if (guild == null) return { status: 500, error: "Guild is NULL" }

	let member = await guild.members.fetch(id).catch(() => null)

	if (member == null) {
		const update = await updateRoles(id, [])
		if (update.error)
			return {
				status: update.status,
				error: "Member doesn't exist and failed to remove roles from the database: " + update.error
			}
		return {
			status: 500,
			error: "Member doesn't exist on the server. His roles were deleted from the database."
		}
	}

	const roles = member.roles.cache.map((role: { toString: () => any }) =>
		role.toString().replace(/[<@&>]/gi, "")
	)

	return await updateRoles(id, roles)
}

export async function updateDiscord(id: string) {
	if (!client.isReady()) await clientReady
	if (guild == null) return { status: 500, error: "Guild is NULL" }

	let member = await guild.members.fetch(id).catch((err) => null)
	if (member == null) return { status: 404, error: "Guild member does not exist" }

	const { data, error } = await getRoles(id)
	if (error) return { status: 404, error: "User not found: " + JSON.stringify(error) }

	const { roles } = data
	if (!roles) return { status: 500, error: "Unexpected Server Error!" }

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

	return { status: 200, error: null }
}
