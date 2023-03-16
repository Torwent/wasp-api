import { PackagesData } from "./types"

const BASE_URL = "https://api.github.com/repos/Torwent/"

let waspLibCache = ""
let srltCache = ""

function isCacheValid(pkg: string, cacheOnly: boolean) {
  if (!cacheOnly) return false

  return (
    (pkg === "srl-t" && srltCache != "") ||
    (pkg === "wasplib" && waspLibCache != "")
  )
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

let compositeCache: PackagesData | undefined = undefined

export async function getLatestPackageVersions(cacheOnly = true) {
  if (cacheOnly && compositeCache != undefined) {
    getLatestPackageVersions(false)
    return compositeCache
  }

  const SRL_URL = BASE_URL + "srl-t/releases/latest"
  const WL_URL = BASE_URL + "wasplib/releases/latest"

  const promises = await Promise.all([fetch(SRL_URL), fetch(WL_URL)])

  const jsons = await Promise.all([promises[0].json(), promises[1].json()])

  compositeCache = {
    srlt_version: jsons[0].name,
    wasplib_version: jsons[1].name,
  }

  return compositeCache
}
