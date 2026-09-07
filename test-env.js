const { config } = require("dotenv");
const path = require("path");
const envPath = path.resolve(__dirname, "scripts/.env.sandbox");
const parsedEnv = config({ path: envPath }).parsed || {};
console.log("DATABASE_URL from dotenv:", parsedEnv.DATABASE_URL);
