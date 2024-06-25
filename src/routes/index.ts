import { rateLimit, type ElysiaApp } from "$src/index"
export default (app: ElysiaApp) =>
	app
		.use(
			rateLimit({
				scoping: "scoped",
				duration: 60 * 1000,
				max: 5,
				errorResponse: "👋 You've reached the 100 requests/min limit.",
				generator: async (req, server, { ip }) => Bun.hash(JSON.stringify(ip)).toString(),
				injectServer: () => app.server
			})
		)
		.get("", () => {
			return { hello: "world" }
		})
