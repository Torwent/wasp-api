import { CheckDiscord, RefreshDiscord } from "../lib/discord"
import express, { Request, Response } from "express"
import rateLimiter from "express-rate-limit"

const DISCORD_ID_REGEX = /^[0-9]{16,20}$/

const router = express.Router()

router.use(express.json())

const rateLimit = rateLimiter({
	max: 1, // the rate limit in reqs
	windowMs: 60 * 1000, // time where limit applies
	message: "You've reached the 1 requests/min limit for roles refresh submissions.",
	statusCode: 429,
	headers: true,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: function (req: any) {
		return req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}
})

/**
 * @swagger
 *  components:
 *    parameters:
 *      DISCORD_ID:
 *        name: DISCORD_ID
 *        in: path
 *        required: true
 *        description: DISCORD_ID identifier of the user.
 *        schema:
 *          type: string
 *          example: 202210488493408256
 */

/**
 * @swagger
 * /discord/{DISCORD_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/DISCORD_ID'
 */

/**
 * @swagger
 * /discord/{DISCORD_ID}:
 *  get:
 *    summary: Get information about the discord user with DISCORD_ID in the waspscripts.com server.
 *    tags:
 *      - discord
 *    responses:
 *      "200":
 *        description: "Response code: 200 - [...]"
 *      "416":
 *        description: "Response code: 416 - That DISCORD_ID is not valid!"
 *      "417":
 *        description: "Response code: 417 - That DISCORD_ID does not exist in waspscripts.com discord server!"
 */

router.get("/:DISCORD_ID", async (req: Request, res: Response) => {
	let { DISCORD_ID } = req.params

	if (!DISCORD_ID_REGEX.test(DISCORD_ID))
		return res.status(416).send("Response code: 416 - That DISCORD_ID is not valid!")

	const roles = await CheckDiscord(DISCORD_ID)

	if (roles.length === 0)
		return res
			.status(417)
			.send(
				"Response code: 417 - That DISCORD_ID does not exist in waspscripts.com discord server!"
			)

	return res.status(200).send("Response code: 200 - " + JSON.stringify(roles))
})

/**
 * @swagger
 * /discord/refresh/{DISCORD_ID}:
 *  parameters:
 *    - $ref: '#components/parameters/DISCORD_ID'
 */

/**
 * @swagger
 * /discord/refresh/{DISCORD_ID}:
 *  get:
 *    summary: Update user roles in waspscriptscom database with info returned from discord.
 *    tags:
 *      - discord
 *    responses:
 *      "200":
 *        description: "Response code: 200 - Roles were updated!"
 *      "416":
 *        description: "Response code: 416 - That DISCORD_ID is not valid!"
 *      "417":
 *        description: "Response code: 417 - That DISCORD_ID does not exist in waspscripts.com discord server!"
 */

router.get("/refresh/:DISCORD_ID", rateLimit, async (req: Request, res: Response) => {
	let { DISCORD_ID } = req.params

	if (!DISCORD_ID_REGEX.test(DISCORD_ID))
		return res.status(416).send("Response code: 416 - That DISCORD_ID is not valid!")

	const result = await RefreshDiscord(DISCORD_ID)

	switch (result) {
		case 500:
			return res
				.status(500)
				.send(
					"Response code: 500 - The server failed to login to the database. This is not an issue on your end."
				)

		case 501:
			return res
				.status(501)
				.send(
					"Response code: 501 - The server failed to find the discord server. This is not an issue on your end."
				)

		case 416:
			return res.status(416).send("Response code: 416 - That DISCORD_ID is not valid!")

		case 417:
			return res
				.status(417)
				.send("Response code: 417 - That DISCORD_ID is not in the discord server!")

		case 200:
			return res
				.status(200)
				.send("Response code: 200 - The user roles were refreshed in waspscripts.com")
	}
})

export default router
