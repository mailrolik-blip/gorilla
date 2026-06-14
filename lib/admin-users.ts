import type { Prisma, PrismaClient } from '@prisma/client';

import { currentUserProfileSelect, publicUserSelect } from './selects';

export const adminUserSelect = {
  ...publicUserSelect,
  staffRole: true,
  profiles: {
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      ...currentUserProfileSelect,
      _count: {
        select: {
          rentalBookings: true,
          teamApplications: true,
          teamMemberships: true,
          trainingBookings: true,
        },
      },
    },
  },
  rentalBookings: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.UserSelect;

export type AdminUserRecord = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

export type AdminUserView = Omit<
  AdminUserRecord,
  'rentalBookings'
> & {
  pointsBalance: number | null;
  activity: {
    participants: number;
    teamApplications: number;
    trainingBookings: number;
    rentalBookings: number;
    promoTickets: number;
    teamMemberships: number;
  };
};

export function mapAdminUser(user: AdminUserRecord): AdminUserView {
  const profileActivity = user.profiles.reduce(
    (activity, profile) => ({
      teamApplications:
        activity.teamApplications + profile._count.teamApplications,
      trainingBookings:
        activity.trainingBookings + profile._count.trainingBookings,
      rentalBookings: activity.rentalBookings + profile._count.rentalBookings,
      teamMemberships: activity.teamMemberships + profile._count.teamMemberships,
    }),
    {
      teamApplications: 0,
      trainingBookings: 0,
      rentalBookings: 0,
      teamMemberships: 0,
    }
  );

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    telegramId: user.telegramId,
    staffRole: user.staffRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profiles: user.profiles,
    pointsBalance: null,
    activity: {
      participants: user.profiles.length,
      teamApplications: profileActivity.teamApplications,
      trainingBookings: profileActivity.trainingBookings,
      rentalBookings: user.rentalBookings.length + profileActivity.rentalBookings,
      promoTickets: 0,
      teamMemberships: profileActivity.teamMemberships,
    },
  };
}

export async function getAdminUserById(
  prisma: PrismaClient,
  userId: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: adminUserSelect,
  });

  return user ? mapAdminUser(user) : null;
}
