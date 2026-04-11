import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // =========================
    // CREATE PARTICIPANT
    // =========================
    if (req.method === 'POST') {
      console.log('CREATE PARTICIPANT BODY:', req.body);

      const {
        userId,
        profileType,
        firstName,
        lastName,
        birthDate,
        parentId,
        cityId,
      } = req.body;

      if (!userId || !profileType) {
        return res.status(400).json({
          error: 'userId and profileType required',
        });
      }

      const participant = await prisma.userProfile.create({
        data: {
          userId: Number(userId),
          profileType,
          firstName: firstName || null,
          lastName: lastName || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          parentId: parentId ? Number(parentId) : null,
          cityId: cityId ? Number(cityId) : null,
        },
      });

      return res.status(201).json(participant);
    }

    // =========================
    // GET ALL PARTICIPANTS
    // =========================
    if (req.method === 'GET') {
      const participants = await prisma.userProfile.findMany({
        include: {
          user: true,
        },
      });

      return res.status(200).json(participants);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}