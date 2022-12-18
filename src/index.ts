import express from "express"
import fs from "fs"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import env from "./lib/env"

const server = express()
const PORT = 8080

//Extended: https://swagger.io/specification/#infoObject

const apis =
  env.ENVIRONMENT === "production"
    ? ["./build/index.js", "./build/routes/*.js"]
    : ["./src/index.ts", "./src/routes/*.ts"]

const swaggerOpions = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: "WaspScripts API",
      version: "1.0.0",
      description: "RESTful API for waspscripts.com",
      contact: {
        name: "@Torwent",
      },
      license: {
        name: "GPLv3",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Development local server",
      },
      {
        url: "https://api.waspscripts.com",
        description: "Live production server",
      },
    ],
  },
  apis: apis,
}

const swaggerUiOptions = {
  customSiteTitle: "WaspScripts API",
  customfavIcon: "https://waspscripts.com/favicon.svg",
  customCss: `
  .topbar-wrapper img {content:url(https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-l.png); height:2.7rem;}
  .swagger-ui .topbar { border-bottom: 1px solid #2a2625; }
  .topbar { position: sticky; top: 0px; z-index: 50 }`,
}

const swaggerDocs = swaggerJsDoc(swaggerOpions)

server.use(express.json())

server.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, swaggerUiOptions)
)

//dynamically load routes from ./routes
fs.readdirSync(__dirname + "/routes/").forEach(async (file) => {
  let route = __dirname + "/routes/" + file
  let path = "/" + file.replace(/\.[jt]s/i, "") //regex replace .js or .ts

  try {
    console.log("Adding route to the server: ", path)
    const item = await import(route)
    server.use(path, item.default)
  } catch (error: any) {
    console.log(error.message)
  }
})

server.listen(PORT, async () => {
  console.log(`Server is alive at:  https://localhost:${PORT}`)
})
