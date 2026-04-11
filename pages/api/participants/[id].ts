import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const participantId = Number(id);

  if (!participantId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    // =========================
    // GET ONE PARTICIPANT
    // =========================
    if (req.method === 'GET') {
      const participant = await prisma.userProfile.findUnique({
        where: { id: participantId },
        include: {
          user: true,
          children: true,
          parent: true,
        },
      });

      return res.status(200).json(participant);
    }

    // =========================
    // UPDATE PARTICIPANT
    // =========================
    if (req.method === 'PATCH') {
      const {
        profileType,
        firstName,
        lastName,
        birthDate,
        cityId,
        parentId,
      } = req.body;

      const updated = await prisma.userProfile.update({
        where: { id: participantId },
        data: {
          profileType,
          firstName,
          lastName,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          cityId,
          parentId,
        },
      });

      return res.status(200).json(updated);
    }

    // =========================
    // DELETE (soft later)
    // =========================
    if (req.method === 'DELETE') {
      await prisma.userProfile.delete({
        where: { id: participantId },
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}