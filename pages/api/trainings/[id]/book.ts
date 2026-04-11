import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const trainingId = Number(req.query.id);
    const { participantId } = req.body;

    if (!trainingId || !participantId) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const training = await prisma.schoolTraining.findUnique({
      where: { trainingId },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const participant = await prisma.userProfile.findUnique({
      where: { id: Number(participantId) },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const booking = await prisma.booking.create({
      data: {
        sessionId: trainingId, // временно оставляем
        participantId: Number(participantId),
        status: 'booked',
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}