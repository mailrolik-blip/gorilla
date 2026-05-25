import type { NextApiRequest, NextApiResponse } from 'next';

import { requireCurrentUser } from '../../../../lib/current-user';
import prisma from '../../../../lib/prisma';
import { openPromoTicketForUser } from '../../../../lib/promo-tickets';
import { HttpError } from '../../../../lib/training-bookings';

function toPositiveInt(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ticketId = toPositiveInt(req.query.id);

  if (!ticketId) {
    return res.status(400).json({ error: 'Invalid promo ticket id' });
  }

  try {
    const currentUser = await requireCurrentUser(prisma, req);
    const ticket = await openPromoTicketForUser(prisma, {
      ticketId,
      userId: currentUser.id,
    });

    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to open promo ticket' });
  }
}
