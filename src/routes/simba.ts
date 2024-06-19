import { rateLimit, t, type ElysiaApp } from "$src/index"
import { CACHE_TIMEOUT, getScript } from "$lib/supabase"

const BASE_URL = "https://api.github.com/repos/Torwent/"

interface CachedVersion {
	version: string
	timestamp: number
}

const versions: Map<string, CachedVersion> = new Map()

async function getPackageVersion(pkg: string) {
	const now = Date.now()
	const cached = versions.get(pkg)

	if (cached && now - cached.timestamp < CACHE_TIMEOUT)
		return { version: cached.version, status: 200, error: null }

	const URL = BASE_URL + pkg + "/releases/latest"

	const response = await fetch(URL)
	if (response.status !== 200)
		return { version: null, status: response.status, error: response.statusText }
	const body = await response.json()
	versions.set(pkg, { version: body.name as string, timestamp: now })
	return { version: body.name as string, status: response.status, error: null }
}

async function getPackagesVersions() {
	const promises = await Promise.all([getPackageVersion("srl-t"), getPackageVersion("wasplib")])
	return { srlt: promises[0], wl: promises[1] }
}

export default (app: ElysiaApp) =>
	app
		.use(
			rateLimit({
				duration: 60 * 1000,
				max: 100,
				errorResponse: "🦁 You've reached the 100 requests/min limit."
			})
		)

		.get(
			"revision/:id",
			async ({ error, params: { id } }) => {
				const data = await getScript(id)

				if (data.error) return error(data.status, data.error)
				if (!data.script) return error("Internal Server Error", "⚠️Unexpected Server Error!")

				return { revision: data.script.protected.revision }
			},
			{ params: t.Object({ id: t.String({ format: "uuid" }) }) }
		)

		.get(
			"package/:name",
			async ({ error, params: { name } }) => {
				const data = await getPackageVersion(name)

				if (data.error) return error(data.status, data.error)
				if (!data.version) return error("Internal Server Error", "⚠️Unexpected Server Error!")

				return { version: data.version }
			},
			{ params: t.Object({ name: t.String({ pattern: "srl-t|SRL-T|wasplib|WaspLib" }) }) }
		)

		.get(
			":id",
			async ({ error, params: { id } }) => {
				const data = await getScript(id)
				if (data.error) return error(data.status, data.error)
				if (!data.script) return error("Internal Server Error", "Unexpected Server Error!")

				return {
					id: data.script.id,
					title: data.script.title,
					author: data.script.protected.username,
					revision: data.script.protected.revision
				}
			},
			{ params: t.Object({ id: t.String({ format: "uuid" }) }) }
		)

		.get(
			":id/:packages",
			async ({ error, params: { id, packages } }) => {
				const data = await getScript(id)

				if (data.error) return error(data.status, data.error)
				if (!data.script) return error("Internal Server Error", "Unexpected Server Error!")

				if (packages) {
					const pkgs = await getPackagesVersions()

					if (pkgs.srlt.error) return error(pkgs.srlt.status, pkgs.srlt.error)
					if (!pkgs.srlt.version) return error("Internal Server Error", "Unexpected Server Error!")
					if (pkgs.wl.error) return error(pkgs.srlt.status, pkgs.wl.error)
					if (!pkgs.wl.version) return error("Internal Server Error", "Unexpected Server Error!")

					return {
						id: data.script.id,
						title: data.script.title,
						author: data.script.protected.username,
						revision: data.script.protected.revision,
						srlt_version: pkgs.srlt.version,
						wasplib_version: pkgs.wl.version
					}
				}

				return {
					id: data.script.id,
					title: data.script.title,
					author: data.script.protected.username,
					revision: data.script.protected.revision
				}
			},
			{
				params: t.Object({
					id: t.String({ format: "uuid" }),
					packages: t.Optional(t.BooleanString())
				})
			}
		)
