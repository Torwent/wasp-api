declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined
			SB_URL: string
			SB_ANON_KEY: string
			SERVICE_USER: string
			SERVICE_PASS: string
			DISCORD_TOKEN: string
			ENVIRONMENT: "dev" | "production" | "debug"
		}
	}
}

export {}
