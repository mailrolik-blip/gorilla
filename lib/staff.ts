import { Prisma, type PrismaClient, type StaffRole } from '@prisma/client';

import { HttpError } from './training-bookings';

export const GLOBAL_STAFF_ROLES: StaffRole[] = ['MANAGER', 'ADMIN'];

type StaffPrisma = PrismaClient | Prisma.TransactionClient;

export async function assertGlobalStaffAccess(
  prisma: StaffPrisma,
  userId: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      staffRole: true,
    },
  });

  if (
    user?.staffRole === null ||
    user?.staffRole === undefined ||
    !GLOBAL_STAFF_ROLES.includes(user.staffRole)
  ) {
    throw new HttpError(403, 'Staff access required');
  }

  return user.staffRole;
}
