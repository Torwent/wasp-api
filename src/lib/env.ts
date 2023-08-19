import fs from "fs"
import dotenv from "dotenv"
const envFiles = [".env.local", "stack.env", ".env"]
let foundEnv = false
for (let i = 0; i < envFiles.length; i++) {
	if (fs.existsSync(envFiles[i])) {
		foundEnv = true
		dotenv.config({ path: envFiles[i] })
		break
	}
}

if (!foundEnv) throw new Error(".env file not found!")

export default process.env
