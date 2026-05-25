import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../lib/current-user';
import { isPromoSymbol, type PromoSymbolTuple } from '../../../lib/promo';
import { createPromoTicketByStaff, listPromoTicketsForStaff } from '../../../lib/promo-tickets';
import prisma from '../../../lib/prisma';
import { HttpError } from '../../../lib/training-bookings';

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);

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

function toOptionalDate(value: unknown): Date | null | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.valueOf()) ? 'invalid' : parsed;
}

function toPromoSymbolTuple(value: unknown): PromoSymbolTuple | 'invalid' {
  if (!Array.isArray(value) || value.length !== 3) {
    return 'invalid';
  }

  const normalized = value.map((item) =>
    typeof item === 'string' && isPromoSymbol(item) ? item : null
  );

  if (normalized.some((item) => item === null)) {
    return 'invalid';
  }

  const [first, second, third] = normalized;

  if (!first || !second || !third) {
    return 'invalid';
  }

  return [first, second, third];
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
      const tickets = await listPromoTicketsForStaff(prisma, currentUser.id);
      return res.status(200).json(tickets);
    } catch (error) {
      console.error(error);

      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to fetch promo tickets for staff' });
    }
  }

  const userId = toPositiveInt(req.body.userId);
  const campaignLabel = toOptionalString(req.body.campaignLabel);
  const expiresAt = toOptionalDate(req.body.expiresAt);
  const sealedSymbols = toPromoSymbolTuple(req.body.sealedSymbols);

  if (!userId) {
    return res.status(400).json({ error: 'userId must be a positive integer' });
  }

  if (campaignLabel === 'invalid') {
    return res.status(400).json({ error: 'campaignLabel must be a string or null' });
  }

  if (expiresAt === 'invalid') {
    return res.status(400).json({ error: 'expiresAt must be a valid date or null' });
  }

  if (sealedSymbols === 'invalid') {
    return res.status(400).json({
      error: 'sealedSymbols must contain exactly 3 valid promo symbols',
    });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const ticket = await createPromoTicketByStaff(prisma, {
      currentUserId: currentUser.id,
      userId,
      campaignLabel: campaignLabel ?? null,
      expiresAt: expiresAt ?? null,
      sealedSymbols,
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create promo ticket' });
  }
}
