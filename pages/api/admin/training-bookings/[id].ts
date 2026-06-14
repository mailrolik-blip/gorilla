import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../../lib/current-user';
import prisma from '../../../../lib/prisma';
import {
  HttpError,
  type StaffManagedTrainingBookingStatus,
  updateTrainingBookingByAdmin,
} from '../../../../lib/training-bookings';

const STAFF_MANAGED_TRAINING_BOOKING_STATUSES: StaffManagedTrainingBookingStatus[] = [
  'booked',
  'cancelled',
];

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function toStaffManagedStatus(
  value: unknown
): StaffManagedTrainingBookingStatus | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  if (
    STAFF_MANAGED_TRAINING_BOOKING_STATUSES.includes(
      value as StaffManagedTrainingBookingStatus
    )
  ) {
    return value as StaffManagedTrainingBookingStatus;
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

  const rawBookingId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const bookingId = toPositiveInt(rawBookingId);
  const status = toStaffManagedStatus(req.body.status);

  if (!bookingId) {
    return res.status(400).json({ error: 'Invalid training booking id' });
  }

  if (status === 'invalid') {
    return res.status(400).json({
      error: 'status must be one of booked, cancelled',
    });
  }

  if (status === undefined) {
    return res.status(400).json({ error: 'At least one of status is required' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const booking = await updateTrainingBookingByAdmin(prisma, {
      bookingId,
      currentUserId: currentUser.id,
      status,
    });

    return res.status(200).json(booking);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to update training booking' });
  }
}
