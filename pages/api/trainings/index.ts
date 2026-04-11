// pages/api/trainings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('BODY:', req.body);
      const {
        name,
        description,
        trainingType,
        cityId,
        trainerId,
        startTime,
        endTime,
        location
      } = req.body;

      if (!name || !startTime || !endTime) {
        return res.status(400).json({
          error: 'name, startTime, endTime required'
        });
      }

      const training = await prisma.schoolTraining.create({
        data: {
          name,
          description: description || '',
          trainingType: trainingType || 'default',
          cityId: Number(cityId),
          trainerId: Number(trainerId) || 0,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location: location || '',
        },
      });

      return res.status(201).json(training);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Create training failed' });
    }
  }

  if (req.method === 'GET') {
    const trainings = await prisma.schoolTraining.findMany();
    return res.json(trainings);
  }

  return res.status(405).end();
}