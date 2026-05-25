import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../lib/current-user';
import { type WinningPromoSymbol } from '../../../lib/promo';
import { createPromoPrizeByStaff, listPromoPrizesForStaff } from '../../../lib/promo-prizes';
import prisma from '../../../lib/prisma';
import { HttpError } from '../../../lib/training-bookings';

const WINNING_SYMBOLS: WinningPromoSymbol[] = [
  'STICK',
  'HELMET',
  'PUCK',
  'GOAL',
  'TRIP',
  'DISCOUNT',
];

function toRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

function toWinningSymbol(
  value: unknown
): WinningPromoSymbol | 'invalid' | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  return WINNING_SYMBOLS.includes(value as WinningPromoSymbol)
    ? (value as WinningPromoSymbol)
    : 'invalid';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'GET') {
    try {
      const currentUser = await requireManagerOrAdmin(prisma, req);
      const prizes = await listPromoPrizesForStaff(prisma, currentUser.id);
      return res.status(200).json(prizes);
    } catch (error) {
      console.error(error);

      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to fetch promo prizes for staff' });
    }
  }

  const symbol = toWinningSymbol(req.body.symbol);
  const title = toRequiredString(req.body.title);
  const description = toOptionalString(req.body.description);
  const isActive = toOptionalBoolean(req.body.isActive);

  if (symbol === 'invalid') {
    return res.status(400).json({
      error: 'symbol must be one of STICK, HELMET, PUCK, GOAL, TRIP, DISCOUNT',
    });
  }

  if (!symbol || !title) {
    return res.status(400).json({ error: 'symbol and title are required' });
  }

  if (description === 'invalid') {
    return res.status(400).json({ error: 'description must be a string or null' });
  }

  if (isActive === 'invalid') {
    return res.status(400).json({ error: 'isActive must be true or false' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const prize = await createPromoPrizeByStaff(prisma, {
      currentUserId: currentUser.id,
      symbol,
      title,
      description: description ?? null,
      ...(isActive !== undefined ? { isActive } : {}),
    });

    return res.status(201).json(prize);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create promo prize' });
  }
}
