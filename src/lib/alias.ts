import "module-alias/register"
import { addAliases } from "module-alias"
addAliases({
	$lib: __dirname,
	$root: __dirname + "../routes"
})
