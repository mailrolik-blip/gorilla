import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { adminUserSelect, mapAdminUser } from '../../../lib/admin-users';
import { requireManagerOrAdmin } from '../../../lib/current-user';
import prisma from '../../../lib/prisma';
import { publicUserSelect } from '../../../lib/selects';
import { HttpError } from '../../../lib/training-bookings';

// Валидация через Zod
const userSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(), // Пример проверки для телефона
  telegramId: z.string().regex(/^\d+$/).optional(), // Проверка на цифры
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      await requireManagerOrAdmin(prisma, req);

      const parsedData = userSchema.safeParse(req.body); // Проверка данных через Zod

      if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error.issues });
      }

      const { email, phone, telegramId } = parsedData.data;

      // Простой fallback для обязательных полей
      if (!email && !phone && !telegramId) {
        return res.status(400).json({
          error: 'At least one auth field (email, phone, or telegramId) is required'
        });
      }

      const user = await prisma.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          telegramId: telegramId ?? null,
        },
        select: publicUserSelect,
      });

      return res.status(201).json(user);

    } catch (error) {
      console.error(error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return res.status(409).json({ error: 'User with these credentials already exists' });
      }

      return res.status(500).json({ error: 'Create user failed' });
    }
  }

  if (req.method === 'GET') {
    try {
      await requireManagerOrAdmin(prisma, req);

      const view = Array.isArray(req.query.view)
        ? req.query.view[0]
        : req.query.view;

      if (view === 'options') {
        const users = await prisma.user.findMany({
          select: publicUserSelect,
          orderBy: {
            createdAt: 'desc',
          },
          take: 200,
        });

        return res.status(200).json(users);
      }

      const users = await prisma.user.findMany({
        select: adminUserSelect,
        orderBy: {
          createdAt: 'desc',
        },
        take: 200,
      });

      return res.status(200).json(users.map(mapAdminUser));
    } catch (error) {
      console.error(error);

      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to fetch CRM users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
