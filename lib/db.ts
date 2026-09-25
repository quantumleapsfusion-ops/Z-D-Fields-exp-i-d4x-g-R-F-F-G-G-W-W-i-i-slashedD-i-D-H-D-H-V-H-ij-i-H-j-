import 'server-only';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// DATABASE_URL is the Supabase transaction-mode pooler (port 6543, pgbouncer=true);
// migrations use DIRECT_URL (schema.prisma `directUrl`).
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
