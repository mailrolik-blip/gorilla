import type { Prisma, PrismaClient, StaffRole } from '@prisma/client';
import type { NextApiRequest } from 'next';

import { currentUserSelect } from './selects';
import { GLOBAL_STAFF_ROLES } from './staff';
import { HttpError } from './training-bookings';

const DEV_CURRENT_USER_HEADER = 'x-user-id';

type CurrentUserRecord = Prisma.UserGetPayload<{
  select: typeof currentUserSelect;
}>;

export type CurrentUserRole = 'USER' | 'COACH' | StaffRole;

export type CurrentUser = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  staffRole: StaffRole | null;
  roles: CurrentUserRole[];
  coachedTeamIds: number[];
  profile: CurrentUserRecord['profiles'][number] | null;
  preferredCity: CurrentUserRecord['profiles'][number]['city'] | null;
  createdAt: Date;
  updatedAt: Date;
};

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function getCurrentUserIdFromSession(req: NextApiRequest): number | null {
  // Reserved for future cookie/session-backed auth providers.
  void req;
  return null;
}

function getCurrentUserIdFromDevHeader(req: NextApiRequest): number | null {
  const rawUserId = req.headers[DEV_CURRENT_USER_HEADER];
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  return parsePositiveInteger(userId);
}

function mapCurrentUser(user: CurrentUserRecord): CurrentUser {
  const profile = user.profiles[0] ?? null;
  const roles: CurrentUserRole[] = ['USER'];
  const coachedTeamIds = user.memberships.map((membership) => membership.teamId);

  if (coachedTeamIds.length > 0) {
    roles.push('COACH');
  }

  if (user.staffRole !== null && !roles.includes(user.staffRole)) {
    roles.push(user.staffRole);
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    telegramId: user.telegramId,
    staffRole: user.staffRole,
    roles,
    coachedTeamIds,
    profile,
    preferredCity: profile?.city ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getCurrentUserId(req: NextApiRequest): number | null {
  return getCurrentUserIdFromSession(req) ?? getCurrentUserIdFromDevHeader(req);
}

export async function getCurrentUser(
  prisma: PrismaClient,
  req: NextApiRequest
): Promise<CurrentUser | null> {
  const currentUserId = getCurrentUserId(req);

  if (!currentUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: currentUserSelect,
  });

  return user ? mapCurrentUser(user) : null;
}

export const optionalCurrentUser = getCurrentUser;

export async function requireCurrentUser(
  prisma: PrismaClient,
  req: NextApiRequest
) {
  const currentUser = await getCurrentUser(prisma, req);

  if (!currentUser) {
    throw new HttpError(401, 'Current user is not authenticated');
  }

  return currentUser;
}

export async function requireStaffUser(
  prisma: PrismaClient,
  req: NextApiRequest
) {
  const currentUser = await requireCurrentUser(prisma, req);

  if (
    currentUser.coachedTeamIds.length === 0 &&
    (currentUser.staffRole === null ||
      !GLOBAL_STAFF_ROLES.includes(currentUser.staffRole))
  ) {
    throw new HttpError(403, 'Staff access required');
  }

  return currentUser;
}

export async function requireManagerOrAdmin(
  prisma: PrismaClient,
  req: NextApiRequest
) {
  const currentUser = await requireCurrentUser(prisma, req);

  if (
    currentUser.staffRole === null ||
    !GLOBAL_STAFF_ROLES.includes(currentUser.staffRole)
  ) {
    throw new HttpError(403, 'Manager or admin access required');
  }

  return currentUser;
}
