import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // =========================
  // CREATE BOOKING
  // =========================
  if (req.method === 'POST') {
    try {
      console.log('BOOKING BODY:', req.body);

      const { participantId, trainingId } = req.body;

      if (!participantId || !trainingId) {
        return res.status(400).json({
          error: 'participantId and trainingId required',
        });
      }

      // проверяем существование участника
      const participant = await prisma.userProfile.findUnique({
        where: { id: Number(participantId) },
      });

      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      // проверяем тренировку
      const training = await prisma.schoolTraining.findUnique({
        where: { trainingId: Number(trainingId) },
      });

      if (!training) {
        return res.status(404).json({ error: 'Training not found' });
      }

      // создаем запись
      const booking = await prisma.trainingBooking.create({
        data: {
          participantId: Number(participantId),
          trainingId: Number(trainingId),
          status: 'booked',
        },
      });

      return res.status(201).json(booking);

    } catch (error: any) {
      console.error(error);

      // ловим дубль записи
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Already booked',
        });
      }

      return res.status(500).json({
        error: 'Failed to create booking',
      });
    }
  }

  // =========================
  // GET BOOKINGS
  // =========================
  if (req.method === 'GET') {
    try {
      const bookings = await prisma.trainingBooking.findMany({
        include: {
          participant: true,
          training: true,
        },
      });

      return res.status(200).json(bookings);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  return res.status(405).end();
}