declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined
      SB_URL: string
      SERVICE_KEY: string
      DISCORD_TOKEN: string
      DOMAIN: string | undefined,
      PORT: number | undefined
      NODE_ENV: "development" | "production" | "debug"
    }
  }
}

export {}
