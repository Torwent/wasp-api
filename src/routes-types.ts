import type { ElysiaWithBaseUrl } from "elysia-autoload";
import type Route0 from "./routes/discord";
import type Route1 from "./routes/index";
import type Route2 from "./routes/simba";
import type Route3 from "./routes/stats";

declare global {
    export type Routes = ElysiaWithBaseUrl<"/discord", ReturnType<typeof Route0>>
              & ElysiaWithBaseUrl<"/", ReturnType<typeof Route1>>
              & ElysiaWithBaseUrl<"/simba", ReturnType<typeof Route2>>
              & ElysiaWithBaseUrl<"/stats", ReturnType<typeof Route3>>
}