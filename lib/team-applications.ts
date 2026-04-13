import { Prisma, type PrismaClient, type TeamApplicationStatus } from '@prisma/client';

import { teamApplicationInclude } from './selects';
import { HttpError } from './training-bookings';

type CreateTeamApplicationInput = {
  currentUserId: number;
  participantId: number;
  teamId: number;
  commentFromApplicant: string | null;
};

const ACTIVE_TEAM_APPLICATION_STATUSES: TeamApplicationStatus[] = [
  'PENDING',
  'APPROVED',
];

export async function createTeamApplication(
  prisma: PrismaClient,
  input: CreateTeamApplicationInput
) {
  const { currentUserId, participantId, teamId, commentFromApplicant } = input;

  return prisma.$transaction(
    async (tx) => {
      const participant = await tx.userProfile.findFirst({
        where: {
          id: participantId,
          userId: currentUserId,
        },
        select: {
          id: true,
        },
      });

      if (!participant) {
        throw new HttpError(404, 'Participant not found');
      }

      const team = await tx.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
        },
      });

      if (!team) {
        throw new HttpError(404, 'Team not found');
      }

      const existingActiveApplication = await tx.teamApplication.findFirst({
        where: {
          participantId,
          teamId,
          status: {
            in: ACTIVE_TEAM_APPLICATION_STATUSES,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingActiveApplication) {
        throw new HttpError(409, 'Active team application already exists');
      }

      return tx.teamApplication.create({
        data: {
          participantId,
          teamId,
          status: 'PENDING',
          commentFromApplicant,
        },
        include: teamApplicationInclude,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function listTeamApplicationsForUser(
  prisma: PrismaClient,
  userId: number
) {
  return prisma.teamApplication.findMany({
    where: {
      participant: {
        userId,
      },
    },
    include: teamApplicationInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function cancelTeamApplicationForUser(
  prisma: PrismaClient,
  applicationId: number,
  userId: number
) {
  const application = await prisma.teamApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      participant: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!application || application.participant.userId !== userId) {
    throw new HttpError(404, 'Team application not found');
  }

  if (application.status === 'CANCELLED') {
    throw new HttpError(409, 'Team application is already cancelled');
  }

  return prisma.teamApplication.update({
    where: { id: applicationId },
    data: {
      status: 'CANCELLED',
    },
    include: teamApplicationInclude,
  });
}
