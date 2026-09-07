import { config } from "dotenv";
import path from "path";

const parsed = config({ path: path.resolve(__dirname, "./scripts/.env.sandbox") }).parsed || {};
if (parsed.DATABASE_URL) {
  process.env.DATABASE_URL = parsed.DATABASE_URL;
}

export default [
  "packages/*",
  "apps/*"
];
