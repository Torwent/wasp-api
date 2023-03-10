import { getScriptData } from "../lib/supabase"
import { ScriptData } from "../lib/types"
import { getLatestPackageVersion } from "../lib/github"
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
 *      PACKAGE_NAME:
 *        name: PACKAGE_NAME
 *        in: path
 *        required: true
 *        description: PACKAGE_NAME identifier of the package. Only "srl-t" and "wasplib" are supported. Casing doesn't matter.
 *        schema:
 *          type: string
 *          example: srl-t
 */

/**
 * @swagger
 * /simba/{SCRIPT_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/SCRIPT_ID'
 */

/**
 * @swagger
 * /simba/{SCRIPT_ID}:
 *  get:
 *    summary: Get information of a particular SCRIPT_ID.
 *    tags:
 *      - simba
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
 * /simba/revision/{SCRIPT_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/SCRIPT_ID'
 */

/**
 * @swagger
 * /simba/revision/{SCRIPT_ID}:
 *  get:
 *    summary: Get information the latest revision of SCRIPT_ID.
 *    tags:
 *      - simba
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

/**
 * @swagger
 * /simba/package/{PACKAGE_NAME}:
 *  parameters:
 *    - $ref: '#components/parameters/PACKAGE_NAME'
 */

/**
 * @swagger
 * /simba/package/{PACKAGE_NAME}:
 *  get:
 *    summary: Get information the latest version of PACKAGE_NAME.
 *    tags:
 *      - simba
 *    responses:
 *      '200':
 *        description: The version was returned successfully!
 *      '416':
 *        description: That PACKAGE_NAME is not valid!
 *      '417':
 *        description: That PACKAGE_NAME does not exist in github!
 */

router.get("/package/:PACKAGE_NAME", async (req: Request, res: Response) => {
  let { PACKAGE_NAME } = req.params

  PACKAGE_NAME = PACKAGE_NAME.toLowerCase()

  if (PACKAGE_NAME != "srl-t" && PACKAGE_NAME != "wasplib")
    return res
      .status(416)
      .send("Response code: 416 - That PACKAGE_NAME is not valid!")

  const data = await getLatestPackageVersion(PACKAGE_NAME)

  if (data == null)
    return res
      .status(417)
      .send("Response code: 417 - That PACKAGE_NAME does not exist in github!")

  const reply = { version: data }

  return res.status(200).send("Response code: 200 - " + JSON.stringify(reply))
})

export default router
