declare global {
  namespace NodeJS {
    interface ProcessEnv {
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
