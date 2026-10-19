import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Reusable PrismaClient singleton instance.
 * Avoids instantiating duplicate connections during development hot reloading
 * or serverless function lifecycle invocations.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
