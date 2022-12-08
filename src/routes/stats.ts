import { StatsEntry } from "./../lib/types"
import { upsertData } from "./../lib/supabase"
import express, { Request, Response } from "express"
import { getData } from "../lib/supabase"
const router = express.Router()

router.use(express.json())

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
 *    schemas:
 *      ScriptJSONPayload:
 *        title: Script JSON Payload
 *        type: object
 *        description: JSON payload to be sent from scripts.
 *        properties:
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
 *    requestBodies:
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
 *  put:
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
router.put("/:biohash", async (req: Request, res: Response) => {
  const { biohash } = req.params
  const reqBody = req.body

  if (!reqBody)
    return res
      .status(400)
      .send({ message: "Bad request! No data was received from your request." })

  const status = await upsertData(parseFloat(biohash), reqBody)

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
 * /stats/{BioHash}:
 *  patch:
 *    summary: stats summary
 *    tags:
 *      - stats
 *    responses:
 *      '400':
 *        description: You can't edit a biohash! Sorry!
 */
router.patch("/:biohash", async (req: Request, res: Response) => {
  res.status(400).send({ message: "You can't edit a biohash! Sorry!" })
})

/**
 * @swagger
 * /stats/{BioHash}:
 *  delete:
 *    summary: stats summary
 *    tags:
 *      - stats
 *    responses:
 *      '400':
 *        description: You can't delete a biohash! Sorry!
 */
router.delete("/:biohash", async (req: Request, res: Response) => {
  res.status(400).send({ message: "You can't delete a biohash! Sorry!" })
})

export default router

/**
 * @swagger
 * schema:
 *  $ref: '#components/schemas/ScriptJSONPayload'
 */
