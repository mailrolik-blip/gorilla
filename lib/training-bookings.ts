import { Prisma, type PrismaClient } from '@prisma/client';

import { trainingBookingInclude } from './selects';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

type CreateTrainingBookingInput = {
  participantId: number;
  trainingId: number;
};

const BOOKED_STATUS = 'booked';
const CANCELLED_STATUS = 'cancelled';

export async function createTrainingBooking(
  prisma: PrismaClient,
  input: CreateTrainingBookingInput
) {
  const { participantId, trainingId } = input;

  return prisma.$transaction(
    async (tx) => {
      const participant = await tx.userProfile.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        throw new HttpError(404, 'Participant not found');
      }

      const training = await tx.schoolTraining.findUnique({
        where: { trainingId },
      });

      if (!training) {
        throw new HttpError(404, 'Training not found');
      }

      if (!training.isActive) {
        throw new HttpError(409, 'Training is not active');
      }

      const existingBooking = await tx.trainingBooking.findUnique({
        where: {
          participantId_trainingId: {
            participantId,
            trainingId,
          },
        },
      });

      if (existingBooking?.status === BOOKED_STATUS) {
        throw new HttpError(409, 'Already booked');
      }

      const activeBookingsCount = await tx.trainingBooking.count({
        where: {
          trainingId,
          status: BOOKED_STATUS,
        },
      });

      if (activeBookingsCount >= training.capacity) {
        throw new HttpError(409, 'Training is full');
      }

      if (existingBooking?.status === CANCELLED_STATUS) {
        return tx.trainingBooking.update({
          where: { id: existingBooking.id },
          data: { status: BOOKED_STATUS },
          include: trainingBookingInclude,
        });
      }

      return tx.trainingBooking.create({
        data: {
          participantId,
          trainingId,
          status: BOOKED_STATUS,
        },
        include: trainingBookingInclude,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
