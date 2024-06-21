import { Elysia } from "elysia"
export { t } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { serverTiming } from "@elysiajs/server-timing"
import { Logestic } from "logestic"
import { rateLimit } from "elysia-rate-limit"
import { autoload } from "elysia-autoload"
import type { Server } from "bun"
export { rateLimit } from "elysia-rate-limit"


console.log(`🔥 wasp-api is starting...`)

const app = new Elysia()

const logger = new Logestic({
	httpLogging: false,
	explicitLogging: true,
	showLevel: true
})
	.use(["time", "userAgent", "method", "path", "duration", "status"])
	.format({
		onSuccess({ time, userAgent, method, path, status, duration }) {
			const timestamp = time.toISOString().replace("T", " ").replace("Z", "")
			if (path === "/docs") return `📚 [${status}] [${timestamp}]: ${userAgent} - ${method} ${path} - ${duration}ms`
			return `${status === 200 ? "💯" : "✅"} [${status}] [${timestamp}]: ${userAgent} - ${method} ${path} - ${duration}ms`
		},
		onFailure({ error, code }) {return `⚠️ Oops, ${error} was thrown with code: ${code}`}		
	})

export const generator = (req: Request, server: Server | null) => req.headers.get('X-Forwarded-For') ?? req.headers.get('CF-Connecting-IP') ?? server?.requestIP(req)?.address ?? ""

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
	
	hostname: process.env.DOMAIN ?? "0.0.0.0",
	port: process.env.PORT ?? 3000,
	maxRequestBodySize: Number.MAX_SAFE_INTEGER
})

export type ElysiaApp = typeof app

console.log(`🦊 wasp-api is running at http://${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Documentation live at http://${app.server?.hostname}:${app.server?.port}/docs`)
