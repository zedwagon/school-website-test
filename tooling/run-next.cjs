const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
	process.loadEnvFile(envPath);
}

const nextPath = require.resolve("next/dist/bin/next", {
	paths: [process.cwd()],
});
const result = spawnSync(
	process.execPath,
	[nextPath, ...process.argv.slice(2)],
	{
		stdio: "inherit",
		env: process.env,
	},
);
if (result.error) {
	console.error(result.error.message);
}
process.exit(result.status ?? 1);
