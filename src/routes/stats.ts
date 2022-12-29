import { updatePassword } from "./../lib/supabase"
import { StatsEntry } from "$lib/types"

import {
  comparePassword,
  upsertData,
  getData,
  hashPassword,
} from "../lib/supabase"
import express, { Request, Response } from "express"

import rateLimiter from "express-rate-limit"

const router = express.Router()

router.use(express.json())

const rateLimit = rateLimiter({
  max: 1, // the rate limit in reqs
  windowMs: 5 * 60 * 1000, // time where limit applies
  message: "You've reached the 1 request limit ",
  statusCode: 429,
  headers: true,
})

/**
 * @swagger
 *  components:
 *    parameters:
 *      BioHash:
 *        name: BioHash
 *        in: path
 *        required: true
 *        description: BioHash identifier of the account.
 *        schema:
 *          type: number
 *          minimum: 0.000000000000001
 *          maximum: 0.999999999999999
 *          example: 0.999999999999999
 *      PathPassword:
 *        name: Password
 *        in: path
 *        required: true
 *        description: Password you want hashed.
 *        schema:
 *          type: string
 *          example: helloworld
 *      JSONPassword:
 *        name: Password
 *        type: string
 *        example: helloworld
 *    schemas:
 *      ScriptJSONPayload:
 *        title: Script JSON Payload
 *        type: object
 *        description: JSON payload to be sent from scripts.
 *        properties:
 *          password:
 *            type: string
 *            example: helloworld
 *          script_id:
 *            type: string
 *            format: uuid
 *            example: 2c9e42f7-cb23-4976-827f-9ffe112a0c3f
 *          experience:
 *            type: integer
 *            minimum: 0
 *            maximum: 10000
 *            example: 100
 *          gold:
 *            type: integer
 *            minimum: 0
 *            maximum: 10000
 *            example: 100
 *          runtime:
 *            type: integer
 *            minimum: 5000
 *            example: 5000
 *          levels:
 *            type: integer
 *            minimum: 0
 *            maximum: 50
 *            example: 1
 *          banned:
 *            type: boolean
 *            example: false
 *      AuthJSON:
 *        title: Auth BioHash/Password
 *        type: object
 *        description: JSON payload to be sent for authentication of a BioHash.
 *        properties:
 *          password:
 *            type: string
 *            example: helloworld
 *      UpdateAuthJSON:
 *        title: Update BioHash password
 *        type: object
 *        description: JSON payload to be sent for authentication of a BioHash and then update the password.
 *        properties:
 *          password:
 *            type: string
 *            example: helloworld
 *          new_password:
 *            type: string
 *            example: helloworld2
 *    requestBodies:
 *      Auth:
 *        description: JSON data to be sent for BioHash authentication.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/AuthJSON'
 *      AuthUpdate:
 *        description: JSON data to be sent to update the password of a given Biohash.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/UpdateAuthJSON'
 *      AccountData:
 *        description: JSON data to be sent from scripts.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/ScriptJSONPayload'
 */

/**
 * @swagger
 * /stats/{BioHash}:
 *  parameters:
 *    - $ref: '#components/parameters/BioHash'
 */

/**
 * @swagger
 * /stats/{BioHash}:
 *  get:
 *    summary: Get information of a particular BioHash.
 *    tags:
 *      - stats
 *    responses:
 *      '200':
 *        description: Successful request!
 *      '417':
 *        description: BioHash not found!
 */
router.get("/:biohash", async (req: Request, res: Response) => {
  const { biohash } = req.params

  const data: StatsEntry | void = await getData(parseFloat(biohash))

  if (!data)
    return res
      .status(417)
      .send({ message: "That biohash does not exist on the database!" })

  return res.status(200).send(data)
})

/**
 * @swagger
 * /stats/{BioHash}:
 *  post:
 *    summary: Push information about a particular BioHash.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats
 *    requestBody:
 *      $ref: '#components/requestBodies/AccountData'
 *    responses:
 *      '201':
 *        description: Successful request! The entry did not exist and was created!
 *      '202':
 *        description: Successful request! Your data was received and the entry was updated!
 *      '400':
 *        description: Bad request!
 *      '401':
 *        description: Unouthorized to do this request. You need to login and have permission for it.
 *      '403':
 *        description: You don't have permissions for this request.
 *      '428':
 *        description: The account is banned, no point in uploading more stats.
 *      '429':
 *        description: Too many requests! We only accept a request from each BioHash every 5 minutes!
 *      '500':
 *        description: Server couldn't login to the database for some reason!
 */
router.post("/:biohash", rateLimit, async (req: Request, res: Response) => {
  const { biohash } = req.params
  const body = req.body

  if (!body)
    return res
      .status(400)
      .send({ message: "Bad request! No data was received from your request." })

  const status = await upsertData(parseFloat(biohash), body)

  if (status >= 500)
    return res
      .status(status)
      .send(
        "Server couldn't login to the database! This is not an issue on your end."
      )
  if (status >= 400) return res.status(status).send("Bad request!")

  return res
    .status(status)
    .send(
      status === 201
        ? "The account was added to the database successfully!"
        : "The account was updated succesffully"
    )
})

/**
 * @swagger
 * /stats/auth/hash/:
 *  post:
 *    summary: Get your Password hashed.
 *    description: Get your Password hashed. Hashes are salted, so every request will have a slightly different result. Same as /stats/auth/hash/{Password} but password is sent via a JSON payload.
 *    tags:
 *      - stats/auth
 *    requestBody:
 *      $ref: '#components/requestBodies/Auth'
 *    responses:
 *      '200':
 *        description: Successful request!
 *      '417':
 *        description: Password empty!
 */
router.post("/auth/hash/", async (req: Request, res: Response) => {
  const { password } = req.body

  const data = await hashPassword(password)

  if (!data) return res.status(417).send({ message: "Password empty!" })

  return res.status(200).send(data)
})

/**
 * @swagger
 * /stats/auth/check/{BioHash}:
 *  post:
 *    summary: Checks if your password matches the hash stored in the database.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats/auth
 *    parameters:
 *      - $ref: '#components/parameters/BioHash'
 *    requestBody:
 *      $ref: '#components/requestBodies/Auth'
 *    responses:
 *      '200':
 *        description: Password matches the stored hash!
 *      '409':
 *        description: Password does not match the database hash!
 *      '417':
 *        description: BioHash Password empty!
 */
router.post("/auth/check/:biohash", async (req: Request, res: Response) => {
  const { biohash } = req.params
  let { password } = req.body

  const hash = await hashPassword(password)

  if (!biohash) return res.status(417).send({ message: "BioHash empty!" })
  if (!hash) return res.status(417).send({ message: "Password empty!" })

  const result = await comparePassword(parseFloat(biohash), password)

  if (result) {
    return res.status(200).send("Password matches the stored hash!")
  } else {
    return res.status(409).send({ message: "Password does not match!" })
  }
})

/**
 * @swagger
 * /stats/auth/update/{BioHash}:
 *  post:
 *    summary: Checks if your password matches the hash stored in the database.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats/auth
 *    parameters:
 *      - $ref: '#components/parameters/BioHash'
 *    requestBody:
 *      $ref: '#components/requestBodies/AuthUpdate'
 *    responses:
 *      '202':
 *        description: Password for that biohash was updated!
 *      '401':
 *        description: Biohash does not exist database hash!
 *      '409':
 *        description: Current password does not match!
 *      '417':
 *        description: Fields missing! All 3 paremeters are required (biohash, password and new_password)
 *      '500':
 *        description: The server couldn't login to the database. This issue is not on your end.
 *      '501':
 *        description: The server couldn't update the database. This issue is not on your end.
 */
router.post("/auth/update/:biohash", async (req: Request, res: Response) => {
  const { biohash } = req.params
  let { password, new_password } = req.body

  if (!biohash) return res.status(417).send({ message: "BioHash empty!" })
  if (!password) return res.status(417).send({ message: "Password empty!" })

  switch (await updatePassword(parseFloat(biohash), password, new_password)) {
    case 401:
      return res.status(401).send({ message: "That biohash doesn't exist" })
    case 409:
      return res
        .status(409)
        .send({ message: "Current password does not match!" })
    case 417:
      return res.status(417).send({ message: "New password empty!" })
    case 202:
      return res.status(200).send("Password for that biohash was updated!")
    case 500:
      return res
        .status(500)
        .send(
          "The server couldn't login to the database. This issue is not on your end."
        )
    case 501:
      return res
        .status(501)
        .send(
          "The server couldn't update the database. This issue is not on your end."
        )
  }
})

export default router
