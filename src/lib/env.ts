import path from "path"
import dotenv from "dotenv"

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Interface to load env variables
interface ENV {
  SB_URL: string | undefined
  SB_ANON_KEY: string | undefined
  SERVICE_USER: string | undefined
  SERVICE_PASS: string | undefined
  DISCORD_TOKEN: string | undefined
  ENVIRONMENT: string | undefined
}

interface Config {
  SB_URL: string
  SB_ANON_KEY: string
  SERVICE_USER: string
  SERVICE_PASS: string
  DISCORD_TOKEN: string
  ENVIRONMENT: "dev" | "production" | "debug"
}

// Loading process.env as ENV interface
const getConfig = (): ENV => {
  return {
    SB_URL: process.env.SB_URL,
    SB_ANON_KEY: process.env.SB_ANON_KEY,
    SERVICE_USER: process.env.SERVICE_USER,
    SERVICE_PASS: process.env.SERVICE_PASS,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    ENVIRONMENT: process.env.ENVIRONMENT,
  }
}

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`)
    }
  }
  return config as Config
}

const config = getConfig()

const sanitizedConfig = getSanitzedConfig(config)

export default sanitizedConfig
