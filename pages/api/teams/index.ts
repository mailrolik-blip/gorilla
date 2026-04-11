// pages/api/teams/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const teams = await prisma.team.findMany();
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching teams' });
    }
  } else if (req.method === 'POST') {
    const { name, cityId } = req.body;
    try {
      const team = await prisma.team.create({
        data: {
          name,
          cityId,
        },
      });
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: 'Error creating team' });
    }
  }
};

export default handler;