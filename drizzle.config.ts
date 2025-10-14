import fs from "fs";
import { defineConfig } from "drizzle-kit";
import path from "path";

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err: Error | unknown) {
    console.log(`Error  ${(err as Error)?.message}`);
  }
}

export default defineConfig({
  dialect: "sqlite", // or "postgres", "mysql", etc.
  schema: "./src/worker/db/schema.ts",
  out: "./src/worker/drizzle", // Directory for migrations
  ...(process.env.NODE_ENV === "production"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
          databaseId: "test-db-v1",
          token: process.env.CLOUDFLARE_D1_API_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
});
