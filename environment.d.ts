declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined
			URL: string
			ANON_KEY: string
			SERVICE_KEY: string
			DOMAIN: string | undefined
			PORT: number | undefined
			NODE_ENV: "development" | "production" | "debug"
		}
	}
}

export {}
