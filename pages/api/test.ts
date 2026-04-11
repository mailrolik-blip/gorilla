// pages/api/test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

export default handler;