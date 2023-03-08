import { deleteData, updatePassword } from "./../lib/supabase"
import { UserEntry } from "$lib/types"

import {
  comparePassword,
  upsertPlayerData,
  getUserData,
  hashPassword,
} from "../lib/supabase"
import express, { Request, Response } from "express"

import rateLimiter from "express-rate-limit"

const UUID_V4_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

const router = express.Router()

router.use(express.json())

const rateLimit = rateLimiter({
  max: 3, // the rate limit in reqs
  windowMs: 3 * 60 * 1000, // time where limit applies
  message: "You've reached the 1 requests/min limit for stats submissions.",
  statusCode: 429,
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: function (req: any) {
    return req.headers["x-forwarded-for"] || req.connection.remoteAddress
  },
})

/**
 * @swagger
 *  components:
 *    parameters:
 *      UUID:
 *        name: UUID
 *        in: path
 *        required: true
 *        description: UUID identifier of the account.
 *        schema:
 *          type: string
 *          example: b36ff484-3659-4c34-8673-ff0f43ad8610
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
 *            maximum: 100000
 *            example: 100
 *          gold:
 *            type: integer
 *            minimum: 0
 *            maximum: 100000
 *            example: 100
 *          runtime:
 *            type: integer
 *            minimum: 5000
 *            example: 5000
 *      AuthJSON:
 *        title: Auth UUID/Password
 *        type: object
 *        description: JSON payload to be sent for authentication of a UUID.
 *        properties:
 *          password:
 *            type: string
 *            example: helloworld
 *      UpdateAuthJSON:
 *        title: Update UUID password
 *        type: object
 *        description: JSON payload to be sent for authentication of a UUID and then update the password.
 *        properties:
 *          password:
 *            type: string
 *            example: helloworld
 *          new_password:
 *            type: string
 *            example: helloworld2
 *    requestBodies:
 *      Auth:
 *        description: JSON data to be sent for UUID authentication.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/AuthJSON'
 *      AuthUpdate:
 *        description: JSON data to be sent to update the password of a given UUID.
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
 * /stats/{UUID}:
 *  parameters:
 *    - $ref: '#components/parameters/UUID'
 */

/**
 * @swagger
 * /stats/{UUID}:
 *  get:
 *    summary: Get information of a particular UUID.
 *    tags:
 *      - stats
 *    responses:
 *      '200':
 *        description: The account was returned successfully!
 *      '416':
 *        description: That UUID is not valid!
 *      '417':
 *        description: That UUID does not exist in waspscripts stats database!
 */
router.get("/:UUID", async (req: Request, res: Response) => {
  const { UUID } = req.params

  if (!UUID_V4_REGEX.test(UUID))
    return res.status(416).send("Response code: 416 - That UUID is not valid!")

  const data: UserEntry | void = await getUserData(UUID)

  if (!data)
    return res.status(417).send("Response code: 417 - That UUID does not exist in waspscripts database!")

  data.password = undefined

  return res.status(200).send("Response code: 200 - " + JSON.stringify(data))
})

/**
 * @swagger
 * /stats/{UUID}:
 *  post:
 *    summary: Push information about a particular UUID.
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
 *      '416':
 *        description: That UUID is not valid!
 *      '429':
 *        description: Too many requests! We only accept a request from each UUID every 5 minutes!
 *      '500':
 *        description: Server couldn't login to the database for some reason!
 */
router.post("/:UUID", rateLimit, async (req: Request, res: Response) => {
  const { UUID } = req.params

  if (!UUID_V4_REGEX.test(UUID))
    return res.status(416).send("Response code: 416 - That UUID is not valid!")

  const body = req.body

  if (!body)
    return res.status(400).send("Response code: 400 - Bad request! The server didn't receive any payload.")

  const status = await upsertPlayerData(UUID, body)

  switch (status) {
    case 201:
      return res
        .status(201)
        .send(
          "Response code: 201 - The account was added to the database successfully!"
        )
    case 202:
      return res
        .status(202)
        .send("Response code: 202 - The account was updated succesfully!")

    case 400:
      return res
        .status(400)
        .send(
          "Response code: 400 - Unauthorized! Your password doesn't match the one in the database for this UUID."
        )
    case 401:
      return res
        .status(400)
        .send("Response code: 401 - Bad request! script_id is missing.")
    case 402:
      return res
        .status(400)
        .send(
          "Response code: 402 - Bad request! script_id doesn't match any in waspscripts."
        )

    case 403:
      return res
        .status(400)
        .send(
          "Response code: 403 - Bad request! Your reported experience is less than the script request minimum limit."
        )
    case 404:
      return res
        .status(400)
        .send(
          "Response code: 404 - Bad request! Your reported experience is more than the script request maximum limit."
        )

    case 405:
      return res
        .status(400)
        .send(
          "Response code: 405 - Bad request! Your reported gold is less than the script request minimum limit."
        )
    case 406:
      return res
        .status(400)
        .send(
          "Response code: 406 - Bad request! Your reported gold is more than the script request maximum limit."
        )

    case 407:
      return res
        .status(400)
        .send(
          "Response code: 407 - Bad request! Your reported runtime is lower than 1000."
        )
    case 408:
      return res
        .status(400)
        .send(
          "Response code: 408 - Bad request! Your report runtime is higher than 15mins."
        )

    case 500:
      return res
        .status(500)
        .send(
          "Response code: 500 - Server error! The server couldn't login to the database! This is not an issue on your end."
        )
    case 501:
      return res
        .status(500)
        .send(
          "Response code: 501 - Server error! The server couldn't insert your row into stats table. This is not an issue on your end."
        )
    case 502:
      return res
        .status(500)
        .send(
          "Response code: 502 - Server error! The server couldn't update your row in stats table. This is not an issue on your end."
        )
  }
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

  if (!data) return res.status(417).send("Response code: 417 - Password empty!")

  return res.status(200).send("Response code: 200 - " + JSON.stringify(data))
})

/**
 * @swagger
 * /stats/auth/check/{UUID}:
 *  post:
 *    summary: Checks if your password matches the hash stored in the database.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats/auth
 *    parameters:
 *      - $ref: '#components/parameters/UUID'
 *    requestBody:
 *      $ref: '#components/requestBodies/Auth'
 *    responses:
 *      '200':
 *        description: Password matches the stored hash!
 *      '409':
 *        description: Password does not match the database hash!
 *      '417':
 *        description: UUID Password empty!
 */
router.post("/auth/check/:UUID", async (req: Request, res: Response) => {
  const { UUID } = req.params
  

  if (!UUID_V4_REGEX.test(UUID))
    return res.status(416).send("Response code: 416 - That UUID is not valid!")
  
  let { password } = req.body
  const hash = await hashPassword(password)

  if (!hash) return res.status(417).send("Response code: 417 - Password empty!")

  const result = await comparePassword(UUID, password)

  if (result)
    return res.status(200).send("Response code: 200 - Password matches the stored hash!")

  return res.status(409).send("Response code: 409 - Password does not match!")
})

/**
 * @swagger
 * /stats/auth/update/{UUID}:
 *  post:
 *    summary: Checks if your password matches the hash stored in the database.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats/auth
 *    parameters:
 *      - $ref: '#components/parameters/UUID'
 *    requestBody:
 *      $ref: '#components/requestBodies/AuthUpdate'
 *    responses:
 *      '202':
 *        description: Password for that UUID was updated!
 *      '401':
 *        description: UUID does not exist database hash!
 *      '409':
 *        description: Current password does not match!
 *      '417':
 *        description: Fields missing! All 3 paremeters are required (UUID, password and new_password)
 *      '500':
 *        description: The server couldn't login to the database. This issue is not on your end.
 *      '501':
 *        description: The server couldn't update the database. This issue is not on your end.
 */
router.post("/auth/update/:UUID", async (req: Request, res: Response) => {
  const { UUID } = req.params

  if (!UUID_V4_REGEX.test(UUID))
    return res.status(416).send("Response code: 416 - That UUID is not valid!")
  let { password, new_password } = req.body

  if (!password) return res.status(417).send("Response code: 417 - Password empty!")

  switch (await updatePassword(UUID, password, new_password)) {
    case 401:
      return res.status(401).send("Response code: 401 - That UUID doesn't exist in waspscripts database!")
    case 409:
      return res.status(409).send("Response code: 409 - Current password does not match!")
    case 417:
      return res.status(417).send("Response code: 417 - New password empty!")
    case 202:
      return res.status(200).send("Response code: 200 - Password for that UUID was updated!")
    case 500:
      return res.status(500).send("Response code: 500 - The server couldn't login to the database. This issue is not on your end.")
    case 501:
      return res.status(501).send("Response code: 501 - The server couldn't update the database. This issue is not on your end.")
  }
})

/**
 * @swagger
 * /delete/{UUID}:
 *  post:
 *    summary: Deletes an entry from the database if the password matches.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    tags:
 *      - stats/auth
 *    parameters:
 *      - $ref: '#components/parameters/UUID'
 *    requestBody:
 *      $ref: '#components/requestBodies/Auth'
 *    responses:
 *      '200':
 *        description: Entry deleted!
 *      '409':
 *        description: Password does not match!
 *      '417':
 *        description: UUID/Password empty!
 *      '500':
 *        description: Server error! The server couldn't login to the database! This is not an issue on your end.
 *      '501':
 *        description: Server error! The server couldn't delete the entry from the database! This is not an issue on your end.
 */
router.post("/delete/:UUID", async (req: Request, res: Response) => {
  const { UUID } = req.params

  if (!UUID_V4_REGEX.test(UUID))
    return res.status(416).send("Response code: 416 - That UUID is not valid!")

  let { password } = req.body

  const hash = await hashPassword(password)

  if (!hash) return res.status(417).send("Response code: 417 - Password empty!")

  const status = await deleteData(UUID, password)

  switch (status) {
    case 200:
      return res.status(200).send("Response code: 200 - Entry deleted!")
    case 400:
      return res.status(400).send("Response code: 400 - Password does not match!")
    case 500:
      return res.status(500).send("Response code: 500 - The server couldn't login to the database! This is not an issue on your end.")
    case 501:
      return res.status(501).send("Response code: 501 - The server couldn't delete the entry from the database! This is not an issue on your end.")
  }
})

export default router