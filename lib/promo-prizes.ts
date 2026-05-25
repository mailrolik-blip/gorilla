import { type PrismaClient } from '@prisma/client';

import { type PromoPrizeSummary, type WinningPromoSymbol } from './promo';
import { promoPrizeSelect } from './selects';
import { assertGlobalStaffAccess } from './staff';
import { HttpError } from './training-bookings';

type CreatePromoPrizeByStaffInput = {
  currentUserId: number;
  symbol: WinningPromoSymbol;
  title: string;
  description: string | null;
  isActive?: boolean;
};

type UpdatePromoPrizeByStaffInput = {
  currentUserId: number;
  prizeId: number;
  title?: string;
  description?: string | null;
  isActive?: boolean;
};

function mapPromoPrize(
  prize: {
    id: number;
    symbol: string;
    title: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
): PromoPrizeSummary {
  if (prize.symbol === 'NO_WIN') {
    throw new Error('NO_WIN cannot be used as a prize symbol');
  }

  return {
    id: prize.id,
    symbol: prize.symbol as WinningPromoSymbol,
    title: prize.title,
    description: prize.description,
    isActive: prize.isActive,
    createdAt: prize.createdAt.toISOString(),
    updatedAt: prize.updatedAt.toISOString(),
  };
}

export async function listPromoPrizesForStaff(
  prisma: PrismaClient,
  currentUserId: number
) {
  await assertGlobalStaffAccess(prisma, currentUserId);

  const prizes = await prisma.promoPrize.findMany({
    select: promoPrizeSelect,
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
  });

  return prizes.map(mapPromoPrize);
}

export async function createPromoPrizeByStaff(
  prisma: PrismaClient,
  input: CreatePromoPrizeByStaffInput
) {
  const { currentUserId, symbol, title, description, isActive } = input;

  await assertGlobalStaffAccess(prisma, currentUserId);

  const existingPrize = await prisma.promoPrize.findUnique({
    where: {
      symbol,
    },
    select: {
      id: true,
    },
  });

  if (existingPrize) {
    throw new HttpError(409, 'Promo prize for this symbol already exists');
  }

  const prize = await prisma.promoPrize.create({
    data: {
      symbol,
      title,
      description,
      ...(isActive !== undefined ? { isActive } : {}),
    },
    select: promoPrizeSelect,
  });

  return mapPromoPrize(prize);
}

export async function updatePromoPrizeByStaff(
  prisma: PrismaClient,
  input: UpdatePromoPrizeByStaffInput
) {
  const { currentUserId, prizeId, title, description, isActive } = input;

  await assertGlobalStaffAccess(prisma, currentUserId);

  const existingPrize = await prisma.promoPrize.findUnique({
    where: {
      id: prizeId,
    },
    select: {
      id: true,
    },
  });

  if (!existingPrize) {
    throw new HttpError(404, 'Promo prize not found');
  }

  const prize = await prisma.promoPrize.update({
    where: {
      id: prizeId,
    },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
    select: promoPrizeSelect,
  });

  return mapPromoPrize(prize);
}
