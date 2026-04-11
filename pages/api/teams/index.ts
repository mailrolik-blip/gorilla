// pages/api/teams/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('BODY:', req.body);
      const { name, cityId } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }

      const team = await prisma.team.create({
        data: {
          name,
          cityId: cityId ? Number(cityId) : null,
        },
      });

      return res.status(201).json(team);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Create team failed' });
    }
  }

  if (req.method === 'GET') {
    const teams = await prisma.team.findMany();
    return res.json(teams);
  }

  return res.status(405).end();
}