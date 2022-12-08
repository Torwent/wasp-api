import express from "express"
import fs from "fs"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const server = express()
const PORT = 8080

//Extended: https://swagger.io/specification/#infoObject
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
  apis: ["./src/index.ts", "./src/routes/*.ts"],
}

const swaggerUiOptions = { customSiteTitle: "WaspScripts API" }

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
  let path = "/" + file.replace(".ts", "")
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
