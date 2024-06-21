import { generator, rateLimit, type ElysiaApp } from "$src/index"

export default (app: ElysiaApp) =>
	app
		.use(
			rateLimit({
				duration: 60 * 1000,
				max: 100,
				errorResponse: "👋 You've reached the 100 requests/min limit.",
				generator: generator
			})
		)
		.get("", () => {
			return { hello: "world" }
		})
