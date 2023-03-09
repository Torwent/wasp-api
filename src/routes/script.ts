import { getScriptData } from "./../lib/supabase"
import { ScriptData } from "$lib/types"

import {
  comparePassword,
  upsertPlayerData,
  getUserData,
  hashPassword,
} from "../lib/supabase"
import express, { Request, Response } from "express"

import rateLimiter from "express-rate-limit"

const SCRIPT_ID_V4_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

const router = express.Router()

router.use(express.json())

const rateLimit = rateLimiter({
  max: 10, // the rate limit in reqs
  windowMs: 3 * 60 * 1000, // time where limit applies
  message: "You've reached the 10 requests/min limit for stats submissions.",
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
 *      SCRIPT_ID:
 *        name: SCRIPT_ID
 *        in: path
 *        required: true
 *        description: SCRIPT_ID identifier of the script.
 *        schema:
 *          type: string
 *          example: cf0a01e4-8d20-41c2-a78e-3d83081b388d
 */

/**
 * @swagger
 * /script/{SCRIPT_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/SCRIPT_ID'
 */

/**
 * @swagger
 * /script/{SCRIPT_ID}:
 *  get:
 *    summary: Get information of a particular SCRIPT_ID.
 *    tags:
 *      - script
 *    responses:
 *      '200':
 *        description: The script was returned successfully!
 *      '416':
 *        description: That SCRIPT_ID is not valid!
 *      '417':
 *        description: That SCRIPT_ID does not exist in waspscripts stats database!
 */
router.get("/:SCRIPT_ID", async (req: Request, res: Response) => {
  const { SCRIPT_ID } = req.params

  if (!SCRIPT_ID_V4_REGEX.test(SCRIPT_ID))
    return res
      .status(416)
      .send("Response code: 416 - That SCRIPT_ID is not valid!")

  const data: ScriptData | void = await getScriptData(SCRIPT_ID)

  if (!data)
    return res
      .status(417)
      .send(
        "Response code: 417 - That SCRIPT_ID does not exist in waspscripts database!"
      )

  return res.status(200).send("Response code: 200 - " + JSON.stringify(data))
})

/**
 * @swagger
 * /script/revision/{SCRIPT_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/SCRIPT_ID'
 */

/**
 * @swagger
 * /script/revision/{SCRIPT_ID}:
 *  get:
 *    summary: Get information the latest revision of SCRIPT_ID.
 *    tags:
 *      - script
 *    responses:
 *      '200':
 *        description: The revision was returned successfully!
 *      '416':
 *        description: That SCRIPT_ID is not valid!
 *      '417':
 *        description: That SCRIPT_ID does not exist in waspscripts stats database!
 */
router.get("/revision/:SCRIPT_ID", async (req: Request, res: Response) => {
  const { SCRIPT_ID } = req.params

  if (!SCRIPT_ID_V4_REGEX.test(SCRIPT_ID))
    return res
      .status(416)
      .send("Response code: 416 - That SCRIPT_ID is not valid!")

  const data: ScriptData | void = await getScriptData(SCRIPT_ID)

  if (!data)
    return res
      .status(417)
      .send(
        "Response code: 417 - That SCRIPT_ID does not exist in waspscripts database!"
      )

  const reply: ScriptData = {
    revision: data.revision,
  }

  return res.status(200).send("Response code: 200 - " + JSON.stringify(reply))
})

export default router
