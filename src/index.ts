import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { serverTiming } from "@elysiajs/server-timing"
import { autoroutes } from "elysia-autoroutes"
import { ip } from "elysia-ip"
export { t } from "elysia"
export { rateLimit } from "elysia-rate-limit"

console.log(`🔥 wasp-api is starting...`)

const app = new Elysia()

app.onResponse((response) => {
	const {
		request,
		path,
		set: { status }
	} = response
	if (path === "/docs" || path === "/docs/" || path === "/docs/json" || path === "/docs/json/")
		return
	const ip = request.headers.get("cf-connecting-ip")
	const userAgent = request.headers.get("user-agent")
	const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "")

	console.log(
		`[${timestamp}]: [${status === 200 ? "💯" : "✅"} ${status}] ${userAgent} ${ip + " " ?? ""}- ${request.method} ${path}`
	)
})

app.use(ip({ headersOnly: true }))

app.use(autoroutes())

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
				license: { name: "GPLv3", url: "https://github.com/Torwent/wasp-api/LICENSE" }
			}
		},
		scalarConfig: { spec: { url: "/docs/json" } },
		path: "/docs",
		exclude: ["/docs", "/docs/json"]
	})
)
app.use(serverTiming())

app.listen({
	hostname: process.env.DOMAIN ?? "0.0.0.0",
	port: process.env.PORT ?? 3000,
	maxRequestBodySize: Number.MAX_SAFE_INTEGER
})

export type ElysiaApp = typeof app

console.log(`🦊 wasp-api is running at http://${app.server!.url}`)
console.log(`📚 Documentation live at http://${app.server!.url}docs`)
