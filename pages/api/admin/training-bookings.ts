import type { NextApiRequest, NextApiResponse } from 'next';

import { requireManagerOrAdmin } from '../../../lib/current-user';
import prisma from '../../../lib/prisma';
import {
  HttpError,
  listTrainingBookingsForAdmin,
} from '../../../lib/training-bookings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const currentUser = await requireManagerOrAdmin(prisma, req);
    const bookings = await listTrainingBookingsForAdmin(prisma, currentUser.id);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch training bookings for admin' });
  }
}
