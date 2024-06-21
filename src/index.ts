import { Elysia } from "elysia"
export { t } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { serverTiming } from "@elysiajs/server-timing"
import { Logestic } from "logestic"
import { rateLimit } from "elysia-rate-limit"
import { autoload } from "elysia-autoload"
import type { Server } from "bun"

console.log(`🔥 wasp-api is starting...`)

const app = new Elysia()

export const generator = async (req: Request, server: Server | null) =>
	Bun.hash(
		JSON.stringify(req.headers.get("cf-connecting-ip") ?? server?.requestIP(req)?.address ?? "")
	).toString()

app.onResponse((response) => {
	const {
		request,
		path,
		set: { status }
	} = response
	if (path === "/docs" || path === "/docs/") return
	const ip = request.headers.get("cf-connecting-ip")
	const userAgent = request.headers.get("user-agent")
	const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "")

	console.log(
		`${status === 200 ? "💯" : "✅"} [${status}] [${timestamp}]: ${userAgent} ${ip} - ${request.method} ${path}`
	)
})

app.use(
	rateLimit({
		scoping: "global",
		duration: 60 * 1000,
		max: 300,
		errorResponse: "👋 You've reached the 300 requests/min limit.",
		generator: generator,
		injectServer: () => app.server
	})
)
app.use(await autoload())
app.use(serverTiming())

app.use(
	swagger({
		documentation: {
			info: {
				title: "Wasp API Documentation",
				version: "2.0.0",
				description: "Documentation on the wapscripts.com API project",
				contact: {
					email: "support@waspscripts.com",
					name: "Torwent",
					url: "https://waspscripts.com"
				},
				license: {
					name: "GPLv3",
					url: "https://github.com/Torwent/wasp-api/LICENSE"
				}
			}
		},
		path: "/docs",
		exclude: ["/docs", "/docs/json"]
	})
)

app.listen({
	hostname: process.env.DOMAIN ?? "0.0.0.0",
	port: process.env.PORT ?? 3000,
	maxRequestBodySize: Number.MAX_SAFE_INTEGER
})

export type ElysiaApp = typeof app

console.log(`🦊 wasp-api is running at http://${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Documentation live at http://${app.server?.hostname}:${app.server?.port}/docs`)
