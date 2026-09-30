import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Pooled (transaction-mode) Postgres connection for the app runtime.
  const adapter = new PrismaPg({ connectionString: serverEnv().databaseUrl });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Lazily constructed Prisma client. Nothing touches `DATABASE_URL` until the
 * first query, so importing this module is safe during `next build`; a blank
 * variable surfaces as `MissingEnvError` from the request that needs the DB.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver === _target ? client : receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** Alias kept for feature code that reads more naturally as `prisma.*`. */
export const prisma = db;
