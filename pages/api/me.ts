import type { NextApiRequest, NextApiResponse } from 'next';

import {
  isDatabaseConfigurationError,
  sendDatabaseConfigurationError,
} from '../../lib/api-runtime';
import { requireCurrentUser, toCurrentUserSummary } from '../../lib/current-user';
import prisma from '../../lib/prisma';
import { HttpError } from '../../lib/training-bookings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const currentUser = await requireCurrentUser(prisma, req);

    return res.status(200).json(toCurrentUserSummary(currentUser));
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode !== 401) {
        console.error(error);
      }

      return res.status(error.statusCode).json({ error: error.message });
    }

    if (isDatabaseConfigurationError(error)) {
      return sendDatabaseConfigurationError(res, 'Fetch current user failed', error);
    }

    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
}
