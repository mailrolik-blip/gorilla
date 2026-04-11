import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import * as z from 'zod';

// Валидация через Zod
const userSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(), // Пример проверки для телефона
  telegramId: z.string().regex(/^\d+$/).optional(), // Проверка на цифры
  passwordHash: z.string().min(8).optional(), // Пример для хешированного пароля
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const parsedData = userSchema.safeParse(req.body); // Проверка данных через Zod

      if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error.errors });
      }

      const { email, phone, telegramId, passwordHash } = parsedData.data;

      // Простой fallback для обязательных полей
      if (!email && !phone && !telegramId) {
        return res.status(400).json({
          error: 'At least one auth field (email, phone, or telegramId) required'
        });
      }

      const user = await prisma.user.create({
        data: {
          email: email || null,
          phone: phone || null,
          telegramId: telegramId || null,
          passwordHash: passwordHash || null,
        },
      });

      return res.status(201).json(user);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Create user failed' });
    }
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany();
    return res.json(users);
  }

  return res.status(405).end();
}