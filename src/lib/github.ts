import { PackagesData } from "./types/collection"

const BASE_URL = "https://api.github.com/repos/Torwent/"

let waspLibCache = ""
let srltCache = ""

function isCacheValid(pkg: string, cacheOnly: boolean) {
	if (!cacheOnly) return false

	return (pkg === "srl-t" && srltCache != "") || (pkg === "wasplib" && waspLibCache != "")
}

export async function getLatestPackageVersion(pkg: string, cacheOnly = true) {
	if (isCacheValid(pkg, cacheOnly)) {
		getLatestPackageVersion(pkg, false)
		return pkg === "srl-t" ? srltCache : waspLibCache
	}

	const URL = BASE_URL + pkg + "/releases/latest"

	const response = await fetch(URL)
	const body = await response.json()

	if (pkg === "srl-t") srltCache = body.name
	else waspLibCache = body.name

	return body.name
}

const versionsCache = new Map<string, PackagesData>()

export async function getLatestPackageVersions(): Promise<PackagesData> {
	const cacheKey = "latestVersions"

	if (versionsCache.has(cacheKey)) {
		return versionsCache.get(cacheKey)!
	}

	console.log("Composite cache is going to be updated!")
	const SRL_URL = BASE_URL + "srl-t/releases/latest"
	const WL_URL = BASE_URL + "wasplib/releases/latest"

	try {
		const promises = await Promise.all([fetch(SRL_URL), fetch(WL_URL)])
		const jsons = await Promise.all(promises.map((response) => response.json()))

		const latestVersions: PackagesData = {
			srlt_version: jsons[0].name,
			wasplib_version: jsons[1].name
		}

		versionsCache.set(cacheKey, latestVersions)

		// Set timeout to clear the cache after 5 minutes (300,000 milliseconds)
		setTimeout(() => {
			versionsCache.delete(cacheKey)
		}, 300000)

		return latestVersions
	} catch (error) {
		// Handle error fetching latest versions
		console.error("Error fetching latest package versions:", error)
		throw error
	}
}
