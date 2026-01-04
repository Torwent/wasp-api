import { autoload } from "esbuild-plugin-autoload"

await Bun.build({
	entrypoints: ["src/index.ts"],
	target: "bun",
	outdir: "build",
	plugins: [autoload("./src/routes")]
}).then(console.log)
