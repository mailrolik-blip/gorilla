import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { getAdminUserById } from '../../../lib/admin-users';
import { requireManagerOrAdmin } from '../../../lib/current-user';
import prisma from '../../../lib/prisma';
import { HttpError } from '../../../lib/training-bookings';

const updateUserSchema = z
  .object({
    email: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
    phone: z.union([z.string().min(5).max(30), z.literal(''), z.null()]).optional(),
    telegramId: z.union([z.string().min(2).max(64), z.literal(''), z.null()]).optional(),
  })
  .strict();

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeOptionalString(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const userId = toPositiveInt(rawId);

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    await requireManagerOrAdmin(prisma, req);

    if (req.method === 'GET') {
      const user = await getAdminUserById(prisma, userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    }

    if (req.method === 'PATCH') {
      const parsed = updateUserSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid user payload' });
      }

      const data: Prisma.UserUpdateInput = {};
      const nextEmail = normalizeOptionalString(parsed.data.email);
      const nextPhone = normalizeOptionalString(parsed.data.phone);
      const nextTelegramId = normalizeOptionalString(parsed.data.telegramId);

      if (nextEmail !== undefined) {
        data.email = nextEmail;
      }

      if (nextPhone !== undefined) {
        data.phone = nextPhone;
      }

      if (nextTelegramId !== undefined) {
        data.telegramId = nextTelegramId;
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      await prisma.user.update({
        where: { id: userId },
        data,
      });

      const updatedUser = await getAdminUserById(prisma, userId);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(updatedUser);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ error: 'User contact already exists' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}
