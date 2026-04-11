// pages/api/city.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Создание нового города
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'City name is required' });
    }

    try {
      const newCity = await prisma.city.create({
        data: {
          name,
        },
      });
      return res.status(201).json(newCity);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error creating city' });
    }
  }

  if (req.method === 'GET') {
    // Получение всех городов
    try {
      const cities = await prisma.city.findMany();
      return res.status(200).json(cities);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error retrieving cities' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}