import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Setup database location for serverless / Vercel environment
const dbDir = path.join(process.cwd(), 'prisma');
const sourceDb = path.join(dbDir, 'dev.db');

if (process.env.VERCEL) {
  const tmpDb = '/tmp/dev.db';
  if (!fs.existsSync(tmpDb) && fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, tmpDb);
    } catch (err) {
      console.error('Error copying dev.db to /tmp:', err);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDb}`;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${sourceDb}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
