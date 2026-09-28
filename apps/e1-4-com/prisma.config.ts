import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate/introspect) uses the direct connection; the app runtime uses
// the pooled DATABASE_URL via the pg driver adapter (see src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
