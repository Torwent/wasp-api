import { ElysiaApp, rateLimit, t } from "$src/index"
import {
	checkPassword,
	deleteUser,
	getStats,
	hashPassword,
	updatePassword,
	upsertStats
} from "$lib/supabase"
import { StatsSchema } from "$src/lib/types/collection"

const uuid = t.Object({
	id: t.String({
		format: "uuid",
		description: "Stats account UUID",
		examples: "7d081fdd-59de-4a4e-9c29-b2f92d9bc697",
		error: "ID must be a valid UUID V4."
	})
})
const authSchema = t.Object({ password: t.String() })

export default (app: ElysiaApp) =>
	app
		.use(
			rateLimit({
				scoping: "scoped",
				duration: 3 * 60 * 1000,
				max: 3,
				errorResponse: "⚙️ You've reached the 100 requests/min limit.",
				generator: async (req, server, { ip }) => Bun.hash(JSON.stringify(ip)).toString(),
				injectServer: () => app.server
			})
		)

		.get(
			":id",
			async ({ error, params: { id } }) => {
				const data = await getStats(id)

				if (data.error) return error(data.status, data.error)
				if (!data.stats) return error("Internal Server Error", "Unexpected Server Error!")

				return data.stats
			},
			{ params: uuid }
		)

		.post(
			":id",
			async ({ error, params: { id }, body, set }) => {
				const { status, error: err } = await upsertStats(id, body)

				if (status === 206) {
					set.status = status
					return err ?? "Something unexpected happened."
				} else if (err) {
					return error(status, err)
				}

				return "✅ User and script stats were successfully updated!"
			},
			{
				params: uuid,
				body: StatsSchema
			}
		)

		.post(
			"auth/hash/",
			async ({ body: { password } }) => {
				return await hashPassword(password)
			},
			{ body: authSchema }
		)

		.post(
			"auth/check/:id",
			async ({ error, params: { id }, body: { password } }) => {
				const { status, error: err } = await checkPassword(id, password)
				if (status === 200) return "✅ Password is valid."
				if (err) return error(status, err)
				return error(500, "⚠️ Unexpected server error!")
			},
			{ params: uuid, body: authSchema }
		)

		.post(
			"auth/update/:id",
			async ({ error, params: { id }, body: { password, new_password }, set }) => {
				if (password === new_password) {
					set.status = 206
					return "❓ Passwords are the same!"
				}
				const { status, error: err } = await updatePassword(id, password, new_password)
				if (status === 200) return "✅ Password updated!"
				if (err) return error(status, err)
				return error(500, "⚠️ Unexpected server error!")
			},
			{ params: uuid, body: t.Object({ password: t.String(), new_password: t.String() }) }
		)

		.post(
			"auth/delete/:id",
			async ({ error, params: { id }, body: { password } }) => {
				const { status, error: err } = await deleteUser(id, password)
				if (status === 200) return "✅ Stats user has been deleted!"
				if (err) return error(status, err)
				return error(500, "⚠️ Unexpected server error!")
			},
			{ params: uuid, body: authSchema }
		)
