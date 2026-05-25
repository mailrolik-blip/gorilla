import { Prisma, type PrismaClient } from '@prisma/client';

import {
  adminPromoTicketSelect,
  myPromoTicketSelect,
} from './selects';
import {
  evaluateTicketSymbols,
  formatPromoCombination,
  getPromoPrizeFallback,
  isPromoSymbol,
  type PromoAdminUserSummary,
  type PromoSymbol,
  type PromoSymbolTuple,
  type PromoTicketAdminView,
  type PromoTicketStatus,
  type PromoTicketUserView,
  toPromoSymbolTuple,
} from './promo';
import { assertGlobalStaffAccess } from './staff';
import { HttpError } from './training-bookings';

type CreatePromoTicketByStaffInput = {
  currentUserId: number;
  userId: number;
  campaignLabel: string | null;
  expiresAt: Date | null;
  sealedSymbols: PromoSymbolTuple;
};

type UpdatePromoTicketByStaffInput = {
  currentUserId: number;
  ticketId: number;
  campaignLabel?: string | null;
  expiresAt?: Date | null;
  status?: Extract<PromoTicketStatus, 'NEW' | 'EXPIRED'>;
  sealedSymbols?: PromoSymbolTuple;
};

type OpenPromoTicketForUserInput = {
  userId: number;
  ticketId: number;
};

type MyPromoTicketRecord = Prisma.PromoTicketGetPayload<{
  select: typeof myPromoTicketSelect;
}>;

type AdminPromoTicketRecord = Prisma.PromoTicketGetPayload<{
  select: typeof adminPromoTicketSelect;
}>;

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function buildPromoTicketCode(userId: number) {
  return `GH-PROMO-${userId}-${Date.now()}`;
}

function normalizePromoTicketStatus(status: string): PromoTicketStatus {
  if (status === 'NEW' || status === 'OPENED' || status === 'WIN' || status === 'LOSE' || status === 'EXPIRED') {
    return status;
  }

  throw new Error(`Unsupported promo ticket status: ${status}`);
}

function formatProfileLabel(profile: {
  firstName: string | null;
  lastName: string | null;
  profileType: string;
} | null) {
  if (!profile) {
    return 'Профиль не указан';
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  return fullName || profile.profileType;
}

function mapAdminUser(user: AdminPromoTicketRecord['user']): PromoAdminUserSummary {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    telegramId: user.telegramId,
    profileLabel: formatProfileLabel(user.profiles[0] ?? null),
  };
}

function mapPrize(prize: MyPromoTicketRecord['prize']) {
  if (!prize || !isPromoSymbol(prize.symbol) || prize.symbol === 'NO_WIN') {
    return null;
  }

  return {
    id: prize.id,
    symbol: prize.symbol,
    title: prize.title,
    description: prize.description,
    isActive: prize.isActive,
    createdAt: prize.createdAt.toISOString(),
    updatedAt: prize.updatedAt.toISOString(),
  };
}

function mapPromoTicketForUser(ticket: MyPromoTicketRecord): PromoTicketUserView {
  const symbols = toPromoSymbolTuple(ticket.symbols as PromoSymbol[]);

  return {
    id: ticket.id,
    code: ticket.code,
    campaignLabel: ticket.campaignLabel,
    status: normalizePromoTicketStatus(ticket.status),
    symbols,
    prize: mapPrize(ticket.prize),
    openedAt: serializeDate(ticket.openedAt),
    expiresAt: serializeDate(ticket.expiresAt),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

function mapPromoTicketForAdmin(ticket: AdminPromoTicketRecord): PromoTicketAdminView {
  const symbols = toPromoSymbolTuple(ticket.symbols as PromoSymbol[]);
  const sealedSymbols = toPromoSymbolTuple(ticket.sealedSymbols as PromoSymbol[]);

  if (!sealedSymbols) {
    throw new Error(`Promo ticket ${ticket.id} has invalid sealed symbols`);
  }

  return {
    id: ticket.id,
    code: ticket.code,
    campaignLabel: ticket.campaignLabel,
    status: normalizePromoTicketStatus(ticket.status),
    sealedSymbols,
    symbols,
    prize: mapPrize(ticket.prize),
    user: mapAdminUser(ticket.user),
    openedAt: serializeDate(ticket.openedAt),
    expiresAt: serializeDate(ticket.expiresAt),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

async function syncExpiredPromoTickets(prisma: PrismaClient) {
  await prisma.promoTicket.updateMany({
    where: {
      status: 'NEW',
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });
}

async function ensurePromoUserExists(
  tx: Prisma.TransactionClient,
  userId: number
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }
}

export async function listPromoTicketsForUser(
  prisma: PrismaClient,
  userId: number
) {
  await syncExpiredPromoTickets(prisma);

  const tickets = await prisma.promoTicket.findMany({
    where: {
      userId,
    },
    select: myPromoTicketSelect,
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
  });

  return tickets.map(mapPromoTicketForUser);
}

export async function openPromoTicketForUser(
  prisma: PrismaClient,
  input: OpenPromoTicketForUserInput
) {
  const { ticketId, userId } = input;

  await syncExpiredPromoTickets(prisma);

  return prisma.$transaction(
    async (tx) => {
      const ticket = await tx.promoTicket.findFirst({
        where: {
          id: ticketId,
          userId,
        },
        select: myPromoTicketSelect,
      });

      if (!ticket) {
        throw new HttpError(404, 'Promo ticket not found');
      }

      if (ticket.status === 'EXPIRED') {
        return mapPromoTicketForUser(ticket);
      }

      if (ticket.status !== 'NEW') {
        return mapPromoTicketForUser(ticket);
      }

      if (ticket.expiresAt && ticket.expiresAt.getTime() < Date.now()) {
        const expiredTicket = await tx.promoTicket.update({
          where: { id: ticket.id },
          data: {
            status: 'EXPIRED',
          },
          select: myPromoTicketSelect,
        });

        return mapPromoTicketForUser(expiredTicket);
      }

      const sealedTicket = await tx.promoTicket.findUnique({
        where: { id: ticket.id },
        select: {
          id: true,
          sealedSymbols: true,
        },
      });

      const sealedSymbols = toPromoSymbolTuple(
        (sealedTicket?.sealedSymbols ?? []) as PromoSymbol[]
      );

      if (!sealedSymbols) {
        throw new HttpError(500, 'Promo ticket has invalid sealed symbols');
      }

      const evaluation = evaluateTicketSymbols(sealedSymbols);
      const prize =
        evaluation.prizeSymbol === null
          ? null
          : await tx.promoPrize.findFirst({
              where: {
                symbol: evaluation.prizeSymbol,
              },
              select: {
                id: true,
              },
            });

      const updatedTicket = await tx.promoTicket.update({
        where: { id: ticket.id },
        data: {
          status: evaluation.status,
          openedAt: new Date(),
          symbols: [...sealedSymbols],
          ...(prize
            ? {
                prize: {
                  connect: { id: prize.id },
                },
              }
            : {
                prize: {
                  disconnect: true,
                },
              }),
        },
        select: myPromoTicketSelect,
      });

      return mapPromoTicketForUser(updatedTicket);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function listPromoTicketsForStaff(
  prisma: PrismaClient,
  currentUserId: number
) {
  await assertGlobalStaffAccess(prisma, currentUserId);
  await syncExpiredPromoTickets(prisma);

  const tickets = await prisma.promoTicket.findMany({
    select: adminPromoTicketSelect,
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
  });

  return tickets.map(mapPromoTicketForAdmin);
}

export async function createPromoTicketByStaff(
  prisma: PrismaClient,
  input: CreatePromoTicketByStaffInput
) {
  const { currentUserId, userId, campaignLabel, expiresAt, sealedSymbols } = input;

  await assertGlobalStaffAccess(prisma, currentUserId);

  const ticket = await prisma.$transaction(async (tx) => {
    await ensurePromoUserExists(tx, userId);

    return tx.promoTicket.create({
      data: {
        user: {
          connect: { id: userId },
        },
        code: buildPromoTicketCode(userId),
        campaignLabel,
        status: 'NEW',
        sealedSymbols: [...sealedSymbols],
        symbols: [],
        expiresAt,
      },
      select: adminPromoTicketSelect,
    });
  });

  return mapPromoTicketForAdmin(ticket);
}

export async function updatePromoTicketByStaff(
  prisma: PrismaClient,
  input: UpdatePromoTicketByStaffInput
) {
  const { currentUserId, ticketId, campaignLabel, expiresAt, status, sealedSymbols } =
    input;

  await assertGlobalStaffAccess(prisma, currentUserId);

  const updatedTicket = await prisma.$transaction(async (tx) => {
    const existingTicket = await tx.promoTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        status: true,
        openedAt: true,
      },
    });

    if (!existingTicket) {
      throw new HttpError(404, 'Promo ticket not found');
    }

    if ((status !== undefined || sealedSymbols !== undefined) && existingTicket.openedAt) {
      throw new HttpError(
        409,
        'Opened promo ticket can no longer change status or sealed symbols'
      );
    }

    const data: Prisma.PromoTicketUpdateInput = {};

    if (campaignLabel !== undefined) {
      data.campaignLabel = campaignLabel;
    }

    if (expiresAt !== undefined) {
      data.expiresAt = expiresAt;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (sealedSymbols !== undefined) {
      data.sealedSymbols = [...sealedSymbols];
    }

    return tx.promoTicket.update({
      where: { id: ticketId },
      data,
      select: adminPromoTicketSelect,
    });
  });

  return mapPromoTicketForAdmin(updatedTicket);
}

export function describePromoTicketResult(ticket: PromoTicketUserView) {
  if (!ticket.symbols) {
    return 'Билет еще не открыт';
  }

  const evaluation = evaluateTicketSymbols(ticket.symbols);

  if (evaluation.status === 'WIN') {
    const prizeTitle = ticket.prize?.title ?? getPromoPrizeFallback(evaluation.prizeSymbol).title;
    return `Выигрыш: ${prizeTitle}`;
  }

  return `Без приза: ${formatPromoCombination(ticket.symbols)}`;
}
