import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // =========================
  // CREATE TRAINING
  // =========================
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

      // базовая валидация
      if (!name || !startTime || !endTime || !cityId) {
        return res.status(400).json({
          error: 'name, cityId, startTime, endTime are required',
        });
      }

      const training = await prisma.schoolTraining.create({
        data: {
          name,
          description: description || null,
          trainingType: trainingType || 'default',

          cityId: Number(cityId),

          // ключевой момент — trainer НЕ обязателен
          trainerId: trainerId ? Number(trainerId) : null,

          startTime: new Date(startTime),
          endTime: new Date(endTime),

          location: location || '',
        },
        include: {
          trainer: true,
          city: true,
        },
      });

      return res.status(201).json(training);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create training' });
    }
  }

  // =========================
  // GET TRAININGS
  // =========================
  if (req.method === 'GET') {
    try {
      const { cityId, trainerId } = req.query;

      const trainings = await prisma.schoolTraining.findMany({
        where: {
          ...(cityId && { cityId: Number(cityId) }),
          ...(trainerId && { trainerId: Number(trainerId) }),
        },
        include: {
          trainer: true,
          city: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      return res.status(200).json(trainings);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch trainings' });
    }
  }

  return res.status(405).end();
}