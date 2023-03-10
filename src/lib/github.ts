const BASE_URL = "https://api.github.com/repos/Torwent/"

let waspLibCache = ""
let srltCache = ""

function isCacheValid(pkg: string, cacheOnly: boolean) {
  if (!cacheOnly) return false

  if (pkg === "srl-t" && srltCache != "") return true
  if (pkg === "wasplib" && waspLibCache != "") return true
}

export async function getLatestPackageVersion(pkg: string, cacheOnly = true) {
  if (isCacheValid(pkg, cacheOnly)) {
    let result: string
    if (pkg === "srl-t") result = srltCache
    else result = waspLibCache
    getLatestPackageVersion(pkg, false)
    return result
  }

  const URL = BASE_URL + pkg + "/releases/latest"

  const response = await fetch(URL)
  const body = await response.json()

  console.log(body.name)

  if (pkg === "srl-t") srltCache = body.name
  else waspLibCache = body.name

  return body.name
}
