import type { NextApiRequest, NextApiResponse } from 'next';

import { getCurrentUserId } from '../../../../lib/current-user';
import prisma from '../../../../lib/prisma';
import { createRentalBooking } from '../../../../lib/rental-bookings';
import { HttpError } from '../../../../lib/training-bookings';

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);

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

  const currentUserId = getCurrentUserId(req);

  if (!currentUserId) {
    return res.status(401).json({ error: 'x-user-id header is required' });
  }

  const rawSlotId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const slotId = toPositiveInt(rawSlotId);
  const participantId =
    req.body.participantId === undefined ||
    req.body.participantId === null ||
    req.body.participantId === ''
      ? null
      : toPositiveInt(req.body.participantId);

  if (!slotId) {
    return res.status(400).json({ error: 'Invalid rental slot id' });
  }

  if (participantId === null && req.body.participantId) {
    return res.status(400).json({ error: 'participantId must be a positive integer' });
  }

  try {
    const booking = await createRentalBooking(prisma, {
      currentUserId,
      slotId,
      participantId,
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create rental booking' });
  }
}
