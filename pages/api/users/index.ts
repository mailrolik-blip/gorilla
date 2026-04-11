import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('BODY:', req.body); 
      const {
        email,
        phone,
        telegramId,
        passwordHash
      } = req.body;

      // простая валидация
      if (!email && !phone && !telegramId) {
        return res.status(400).json({
          error: 'At least one auth field required'
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