import { runMigrations } from "../lib/db";

await runMigrations();

console.log("Database migrations complete.");
