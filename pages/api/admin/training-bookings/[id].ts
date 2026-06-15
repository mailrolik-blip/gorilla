import type { NextApiRequest, NextApiResponse } from 'next';
import type { CrmRequestStatus } from '@prisma/client';

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
const CRM_REQUEST_STATUSES: CrmRequestStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'CONTACTED',
  'BOOKED',
  'REJECTED',
  'CANCELLED',
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

function toCrmStatus(value: unknown): CrmRequestStatus | undefined | 'invalid' {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return 'invalid';
  }

  return CRM_REQUEST_STATUSES.includes(value as CrmRequestStatus)
    ? (value as CrmRequestStatus)
    : 'invalid';
}

function toOptionalManagerNote(
  value: unknown
): string | null | undefined | 'invalid' {
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
  const crmStatus = toCrmStatus(req.body.crmStatus);
  const managerNote = toOptionalManagerNote(req.body.managerNote);

  if (!bookingId) {
    return res.status(400).json({ error: 'Invalid training booking id' });
  }

  if (status === 'invalid') {
    return res.status(400).json({
      error: 'status must be one of booked, cancelled',
    });
  }

  if (crmStatus === 'invalid') {
    return res.status(400).json({
      error: 'crmStatus must be one of NEW, IN_PROGRESS, CONTACTED, BOOKED, REJECTED, CANCELLED',
    });
  }

  if (managerNote === 'invalid') {
    return res.status(400).json({ error: 'managerNote must be a string or null' });
  }

  if (status === undefined && crmStatus === undefined && managerNote === undefined) {
    return res.status(400).json({ error: 'At least one of status, crmStatus or managerNote is required' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const booking = await updateTrainingBookingByAdmin(prisma, {
      bookingId,
      currentUserId: currentUser.id,
      status,
      crmStatus,
      managerNote,
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
