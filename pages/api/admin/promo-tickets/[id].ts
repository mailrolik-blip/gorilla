import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../../lib/current-user';
import {
  isPromoSymbol,
  type PromoSymbolTuple,
} from '../../../../lib/promo';
import { updatePromoTicketByStaff } from '../../../../lib/promo-tickets';
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

function toOptionalTicketStatus(
  value: unknown
): 'NEW' | 'EXPIRED' | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'NEW' || value === 'EXPIRED') {
    return value;
  }

  return 'invalid';
}

function toOptionalPromoSymbolTuple(
  value: unknown
): PromoSymbolTuple | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

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
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ticketId = toPositiveInt(req.query.id);

  if (!ticketId) {
    return res.status(400).json({ error: 'Invalid promo ticket id' });
  }

  const campaignLabel = toOptionalString(req.body.campaignLabel);
  const expiresAt = toOptionalDate(req.body.expiresAt);
  const status = toOptionalTicketStatus(req.body.status);
  const sealedSymbols = toOptionalPromoSymbolTuple(req.body.sealedSymbols);

  if (campaignLabel === 'invalid') {
    return res.status(400).json({ error: 'campaignLabel must be a string or null' });
  }

  if (expiresAt === 'invalid') {
    return res.status(400).json({ error: 'expiresAt must be a valid date or null' });
  }

  if (status === 'invalid') {
    return res.status(400).json({ error: 'status can only be NEW or EXPIRED' });
  }

  if (sealedSymbols === 'invalid') {
    return res.status(400).json({
      error: 'sealedSymbols must contain exactly 3 valid promo symbols',
    });
  }

  if (
    campaignLabel === undefined &&
    expiresAt === undefined &&
    status === undefined &&
    sealedSymbols === undefined
  ) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const ticket = await updatePromoTicketByStaff(prisma, {
      currentUserId: currentUser.id,
      ticketId,
      ...(campaignLabel !== undefined ? { campaignLabel } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(sealedSymbols !== undefined ? { sealedSymbols } : {}),
    });

    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to update promo ticket' });
  }
}
