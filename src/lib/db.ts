import { SQL } from "bun";
import { readdir } from "node:fs/promises";
import path from "node:path";

export type DeviceRow = {
  id: string;
  deviceKey: string;
  token: string;
  topic: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function resolveDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const url = new URL(databaseUrl);
  url.searchParams.delete("schema");

  return url.toString();
}

export const sql = new SQL(resolveDatabaseUrl());

type MigrationRow = {
  id: number;
  name: string;
  applied_at: string | Date;
};

async function ensureMigrationTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      "id" BIGSERIAL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function runMigrations() {
  await ensureMigrationTable();

  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const migrationFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of migrationFiles) {
    const appliedRows = (await sql`
      SELECT "id", "name", "applied_at"
      FROM "_migrations"
      WHERE "name" = ${fileName}
      LIMIT 1
    `) as MigrationRow[];

    if (appliedRows.length > 0) {
      continue;
    }

    const filePath = path.join(migrationsDir, fileName);
    const file = Bun.file(filePath);
    const query = await file.text();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      continue;
    }

    await sql.file(filePath);
    await sql`
      INSERT INTO "_migrations" ("name")
      VALUES (${fileName})
    `;

    console.log(`Applied migration: ${fileName}`);
  }
}

export async function ensureDatabase() {
  await runMigrations();
}
