import { Prisma } from '@prisma/client';
import type { NextApiResponse } from 'next';

export function assertDatabaseUrlConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
}

export function isDatabaseConfigurationError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error &&
      (error.message.includes('Environment variable not found: DATABASE_URL') ||
        error.message.includes('DATABASE_URL is not configured')))
  );
}

export function sendDatabaseConfigurationError(
  res: NextApiResponse,
  context: string,
  error: unknown
) {
  console.error(`${context}: DATABASE_URL is not configured for runtime`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });

  return res.status(503).json({
    error: 'Сервис временно недоступен. Проверьте настройки сервера и попробуйте позже.',
  });
}
