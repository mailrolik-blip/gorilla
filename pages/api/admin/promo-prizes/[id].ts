import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../../lib/current-user';
import { updatePromoPrizeByStaff } from '../../../../lib/promo-prizes';
import prisma from '../../../../lib/prisma';
import { HttpError } from '../../../../lib/training-bookings';

function toPositiveInt(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function toOptionalString(value: unknown): string | null | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toOptionalBoolean(value: unknown): boolean | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return 'invalid';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prizeId = toPositiveInt(req.query.id);

  if (!prizeId) {
    return res.status(400).json({ error: 'Invalid promo prize id' });
  }

  const title = toOptionalString(req.body.title);
  const description = toOptionalString(req.body.description);
  const isActive = toOptionalBoolean(req.body.isActive);

  if (title === 'invalid') {
    return res.status(400).json({ error: 'title must be a string or null' });
  }

  if (title === null) {
    return res.status(400).json({ error: 'title cannot be null' });
  }

  if (description === 'invalid') {
    return res.status(400).json({ error: 'description must be a string or null' });
  }

  if (isActive === 'invalid') {
    return res.status(400).json({ error: 'isActive must be true or false' });
  }

  if (title === undefined && description === undefined && isActive === undefined) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const prize = await updatePromoPrizeByStaff(prisma, {
      currentUserId: currentUser.id,
      prizeId,
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });

    return res.status(200).json(prize);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to update promo prize' });
  }
}
