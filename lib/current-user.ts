import type { NextApiRequest } from 'next';

export function getCurrentUserId(req: NextApiRequest): number | null {
  const rawUserId = req.headers['x-user-id'];
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

  if (!userId) {
    return null;
  }

  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
}
