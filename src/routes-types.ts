import type { ElysiaWithBaseUrl } from "elysia-autoload"
import type Route0 from "./routes/index"
import type Route1 from "./routes/simba"
import type Route2 from "./routes/stats"

declare global {
	export type Routes = ElysiaWithBaseUrl<"/", ReturnType<typeof Route0>> &
		ElysiaWithBaseUrl<"/simba", ReturnType<typeof Route1>> &
		ElysiaWithBaseUrl<"/stats", ReturnType<typeof Route2>>
}
