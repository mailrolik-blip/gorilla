import type { NextApiRequest, NextApiResponse } from 'next';

import { getCurrentUserId } from '../../../lib/current-user';
import prisma from '../../../lib/prisma';
import { listRentalBookingsForStaff } from '../../../lib/rental-bookings';
import { HttpError } from '../../../lib/training-bookings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const currentUserId = getCurrentUserId(req);

  if (!currentUserId) {
    return res.status(401).json({ error: 'x-user-id header is required' });
  }

  try {
    const bookings = await listRentalBookingsForStaff(prisma, currentUserId);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch rental bookings for staff' });
  }
}
