import { Elysia } from "elysia"
export { t } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { serverTiming } from "@elysiajs/server-timing"
import { Logestic } from "logestic"
import { rateLimit } from "elysia-rate-limit"
import { autoload } from "elysia-autoload"
export { rateLimit } from "elysia-rate-limit"

console.log(`🔥 wasp-api is starting...`)

const app = new Elysia()

const logger = new Logestic({
	httpLogging: false,
	explicitLogging: true,
	showLevel: true
})
	.use(["time", "ip", "userAgent", "method", "path", "duration", "status", "referer"])
	.format({
		onSuccess({ time, ip, userAgent, method, path, status, duration }) {
			const emoji = status === 200 ? "💯" : "✅"
			const timestamp = time.toISOString().replace("T", " ").replace("Z", "")
			return `${emoji} <${status}>[${timestamp}]: ${userAgent} - ${ip} - ${method} ${path} - ${duration}μs`
		},
		onFailure({ error, code }) {
			return `⚠️ Oops, ${error} was thrown with code: ${code}`
		}
	})

app.use(logger)
app.use(rateLimit())
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
	hostname: process.env.DOMAIN ?? "localhost",
	port: process.env.PORT ?? 3000,
	maxRequestBodySize: Number.MAX_SAFE_INTEGER
})

export type ElysiaApp = typeof app

console.log(`🦊 wasp-api is running at http://${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Documentation live at http://${app.server?.hostname}:${app.server?.port}/docs`)
