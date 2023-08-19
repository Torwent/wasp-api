import { getScriptData } from "$lib/supabase"
import { getLatestPackageVersion, getLatestPackageVersions } from "$lib/github"
import express, { Request, Response } from "express"
import { Script, ScriptResponse } from "$lib/types/collection"
const SCRIPT_ID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

const router = express.Router()

router.use(express.json())

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
 *      GET_PACKAGES:
 *        name: GET_PACKAGES
 *        in: path
 *        required: false
 *        description: wether to retrieve the latest packages as well or not.
 *        schema:
 *          type: boolean
 *          example: true
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
		return res.status(416).send("Response code: 416 - That SCRIPT_ID is not valid!")

	const data: Script | void = await getScriptData(SCRIPT_ID)

	if (!data)
		return res
			.status(417)
			.send("Response code: 417 - That SCRIPT_ID does not exist in waspscripts database!")

	const reply: ScriptResponse = {
		revision: data.protected.revision
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
		return res.status(416).send("Response code: 416 - That PACKAGE_NAME is not valid!")

	const data = await getLatestPackageVersion(PACKAGE_NAME)

	if (data == null)
		return res.status(417).send("Response code: 417 - That PACKAGE_NAME does not exist in github!")

	const reply = { version: data }

	return res.status(200).send("Response code: 200 - " + JSON.stringify(reply))
})

/**
 * @swagger
 * /simba/{SCRIPT_ID}/{GET_PACKAGES}:
 *  parameters:
 *    - $ref: '#components/parameters/SCRIPT_ID'
 *    - $ref: '#components/parameters/GET_PACKAGES'
 */

/**
 * @swagger
 * /simba/{SCRIPT_ID}/{GET_PACKAGES}:
 *  get:
 *    summary: Get information of a particular SCRIPT_ID. You can optionally also ask the server to give you the latest SRL-T and WaspLib versions.
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
router.get("/:SCRIPT_ID/:GET_PACKAGES?", async (req: Request, res: Response) => {
	const { SCRIPT_ID } = req.params
	const GET_PACKAGES = req.params.GET_PACKAGES
		? req.params.GET_PACKAGES.toLowerCase() === "true"
		: true

	if (!SCRIPT_ID_V4_REGEX.test(SCRIPT_ID))
		return res.status(416).send("Response code: 416 - That SCRIPT_ID is not valid!")

	const script = await getScriptData(SCRIPT_ID)

	if (!script)
		return res
			.status(417)
			.send("Response code: 417 - That SCRIPT_ID does not exist in waspscripts database!")

	let srlV = undefined
	let wlV = undefined
	if (GET_PACKAGES) {
		const pkgs = await getLatestPackageVersions()
		srlV = pkgs.srlt_version
		wlV = pkgs.wasplib_version
	}

	const response: ScriptResponse = {
		id: script.id,
		title: script.title,
		author: script.protected.username ?? undefined,
		revision: script.protected.revision
	}

	if (srlV != null) response.srlt_version = srlV
	if (wlV != null) response.wasplib_version = wlV

	return res.status(200).send("Response code: 200 - " + JSON.stringify(response))
})

export default router
