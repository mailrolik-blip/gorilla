// pages/api/trainings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const trainings = await prisma.schoolTraining.findMany();
      res.status(200).json(trainings);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching trainings' });
    }
  } else if (req.method === 'POST') {
    const { name, description, trainingType, cityId, trainerId, startTime, endTime, location } = req.body;
    try {
      const training = await prisma.schoolTraining.create({
        data: {
          name,
          description,
          trainingType,
          cityId,
          trainerId,
          startTime,
          endTime,
          location,
        },
      });
      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ error: 'Error creating training' });
    }
  }
};

export default handler;