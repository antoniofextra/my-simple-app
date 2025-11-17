import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "prisma/.env"),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
