declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined
      SB_URL: string
      SERVICE_KEY: string
      DISCORD_TOKEN: string
      ENVIRONMENT: "development" | "production" | "debug"
    }
  }
}

export {}
