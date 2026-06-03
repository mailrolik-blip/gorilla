import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getCurrentUserById,
  setAuthCurrentUserCookie,
  toCurrentUserSummary,
} from '../../../lib/current-user';
import { verifyPassword } from '../../../lib/password-auth';
import prisma from '../../../lib/prisma';

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(value: string) {
  return value.replace(/[()\s-]/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const identifier = toText(req.body.identifier);
  const password = toText(req.body.password);

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Укажите почту или телефон и пароль.' });
  }

  const normalizedEmail = identifier.includes('@') ? identifier.toLowerCase() : null;
  const normalizedPhone = normalizePhone(identifier);
  const user = await prisma.user.findFirst({
    where: normalizedEmail
      ? {
          email: normalizedEmail,
        }
      : {
          phone: normalizedPhone,
        },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Неверная почта, телефон или пароль.' });
  }

  const currentUser = await getCurrentUserById(prisma, user.id);

  if (!currentUser) {
    return res.status(500).json({ error: 'Не удалось открыть аккаунт.' });
  }

  setAuthCurrentUserCookie(res, currentUser.id);

  return res.status(200).json({
    ok: true,
    currentUser: toCurrentUserSummary(currentUser),
  });
}
