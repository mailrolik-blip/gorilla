import type { NextApiRequest, NextApiResponse } from 'next';

import { getCurrentUserId } from '../../../lib/current-user';
import prisma from '../../../lib/prisma';
import { listTrainingBookingsForUser } from '../../../lib/training-bookings';

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
    const bookings = await listTrainingBookingsForUser(prisma, currentUserId);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch current user bookings' });
  }
}
