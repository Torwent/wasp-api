import { rateLimit, t, type ElysiaApp } from "$src/index"
import { checkDiscord, refreshDiscord, updateDiscord } from "$lib/discord"

const DISCORD_ID_REGEX = "[0-9]{16,20}"

export default (app: ElysiaApp) =>
	app
		.use(
			rateLimit({
				scoping: "scoped",
				duration: 60 * 1000,
				max: 100,
				errorResponse: "🤖 You've reached the 100 requests/min limit.",
				generator: async (req, server, { ip }) => Bun.hash(JSON.stringify(ip)).toString(),
				injectServer: () => app.server
			})
		)

		.get(
			":discord",
			async ({ error, params: { id } }) => {
				const data = await checkDiscord(id)

				if (data.error) return error(data.status, data.error)
				if (!data.roles) return error("Internal Server Error", "Unexpected Server Error!")

				return { revision: data.roles }
			},
			{ params: t.Object({ id: t.String({ pattern: DISCORD_ID_REGEX }) }) }
		)

		.get(
			"refresh/:id",
			async ({ error, params: { id } }) => {
				const data = await refreshDiscord(id)
				if (data.error) return error(data.status, data.error)

				return "The user roles were refreshed in waspscripts.com"
			},
			{ params: t.Object({ id: t.String({ pattern: DISCORD_ID_REGEX }) }) }
		)

		.get(
			"update/:id",
			async ({ error, params: { id } }) => {
				const data = await updateDiscord(id)
				if (data.error) return error(data.status, data.error)

				return "The user roles were updated on the discord server"
			},
			{ params: t.Object({ id: t.String({ pattern: DISCORD_ID_REGEX }) }) }
		)
