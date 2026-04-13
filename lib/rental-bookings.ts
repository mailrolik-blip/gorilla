import {
  Prisma,
  type PrismaClient,
  type RentalBookingStatus,
} from '@prisma/client';

import { myRentalBookingSelect, publicRentalSlotSelect } from './selects';
import { HttpError } from './training-bookings';

type CreateRentalBookingInput = {
  currentUserId: number;
  slotId: number;
  participantId: number | null;
};

type PublicRentalSlotRecord = Prisma.RentalSlotGetPayload<{
  select: typeof publicRentalSlotSelect;
}>;

type MyRentalBookingRecord = Prisma.RentalBookingGetPayload<{
  select: typeof myRentalBookingSelect;
}>;

const ACTIVE_RENTAL_BOOKING_STATUSES: RentalBookingStatus[] = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
];

const CANCELLED_RENTAL_BOOKING_STATUS: RentalBookingStatus = 'CANCELLED';

function mapPublicRentalSlot(slot: PublicRentalSlotRecord) {
  return {
    id: slot.id,
    resource: {
      id: slot.resource.id,
      name: slot.resource.name,
      resourceType: slot.resource.resourceType,
    },
    facility: {
      id: slot.resource.facility.id,
      name: slot.resource.facility.name,
    },
    city: slot.resource.facility.city,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    status: slot.status,
    availability: slot.status,
  };
}

function mapRentalBookingForUser(booking: MyRentalBookingRecord) {
  return {
    id: booking.id,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    participant: booking.participant,
    slot: {
      id: booking.slot.id,
      startsAt: booking.slot.startsAt,
      endsAt: booking.slot.endsAt,
      status: booking.slot.status,
    },
    resource: {
      id: booking.slot.resource.id,
      name: booking.slot.resource.name,
      resourceType: booking.slot.resource.resourceType,
    },
    facility: {
      id: booking.slot.resource.facility.id,
      name: booking.slot.resource.facility.name,
    },
    city: booking.slot.resource.facility.city,
  };
}

async function ensureCurrentUserExists(
  tx: Prisma.TransactionClient,
  currentUserId: number
) {
  const user = await tx.user.findUnique({
    where: { id: currentUserId },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
}

async function resolveParticipantForCurrentUser(
  tx: Prisma.TransactionClient,
  currentUserId: number,
  participantId: number | null
) {
  if (participantId === null) {
    return null;
  }

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

  return participant;
}

export async function listPublicRentalSlots(prisma: PrismaClient) {
  const slots = await prisma.rentalSlot.findMany({
    where: {
      isPublic: true,
    },
    select: publicRentalSlotSelect,
    orderBy: [
      {
        startsAt: 'asc',
      },
      {
        id: 'asc',
      },
    ],
  });

  return slots.map(mapPublicRentalSlot);
}

export async function createRentalBooking(
  prisma: PrismaClient,
  input: CreateRentalBookingInput
) {
  const { currentUserId, slotId, participantId } = input;

  return prisma.$transaction(
    async (tx) => {
      await ensureCurrentUserExists(tx, currentUserId);
      const participant = await resolveParticipantForCurrentUser(
        tx,
        currentUserId,
        participantId
      );

      const slot = await tx.rentalSlot.findUnique({
        where: { id: slotId },
        select: {
          id: true,
          isPublic: true,
          status: true,
        },
      });

      if (!slot || !slot.isPublic) {
        throw new HttpError(404, 'Rental slot not found');
      }

      if (slot.status !== 'AVAILABLE') {
        throw new HttpError(409, 'Rental slot is not available');
      }

      const existingActiveBooking = await tx.rentalBooking.findFirst({
        where: {
          slotId,
          status: {
            in: ACTIVE_RENTAL_BOOKING_STATUSES,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingActiveBooking) {
        throw new HttpError(409, 'Rental slot is already booked');
      }

      const createdBooking = await tx.rentalBooking.create({
        data: {
          slot: {
            connect: { id: slotId },
          },
          user: {
            connect: { id: currentUserId },
          },
          status: 'PENDING_CONFIRMATION',
          ...(participant
            ? {
                participant: {
                  connect: { id: participant.id },
                },
              }
            : {}),
        },
        select: {
          id: true,
        },
      });

      await tx.rentalSlot.update({
        where: { id: slotId },
        data: {
          status: 'BOOKED',
        },
      });

      const booking = await tx.rentalBooking.findUnique({
        where: {
          id: createdBooking.id,
        },
        select: myRentalBookingSelect,
      });

      if (!booking) {
        throw new HttpError(500, 'Rental booking was not created');
      }

      return mapRentalBookingForUser(booking);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function listRentalBookingsForUser(
  prisma: PrismaClient,
  userId: number
) {
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      userId,
    },
    select: myRentalBookingSelect,
  });

  return bookings
    .sort(
      (left, right) =>
        left.slot.startsAt.getTime() - right.slot.startsAt.getTime()
    )
    .map(mapRentalBookingForUser);
}

export async function cancelRentalBookingForUser(
  prisma: PrismaClient,
  bookingId: number,
  userId: number
) {
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      userId: true,
      slotId: true,
    },
  });

  if (!booking || booking.userId !== userId) {
    throw new HttpError(404, 'Rental booking not found');
  }

  if (booking.status === CANCELLED_RENTAL_BOOKING_STATUS) {
    throw new HttpError(409, 'Rental booking is already cancelled');
  }

  return prisma.$transaction(async (tx) => {
    await tx.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: CANCELLED_RENTAL_BOOKING_STATUS,
      },
    });

    const remainingActiveBookings = await tx.rentalBooking.count({
      where: {
        slotId: booking.slotId,
        status: {
          in: ACTIVE_RENTAL_BOOKING_STATUSES,
        },
      },
    });

    if (remainingActiveBookings === 0) {
      const slot = await tx.rentalSlot.findUnique({
        where: { id: booking.slotId },
        select: {
          status: true,
        },
      });

      if (slot?.status === 'BOOKED') {
        await tx.rentalSlot.update({
          where: { id: booking.slotId },
          data: {
            status: 'AVAILABLE',
          },
        });
      }
    }

    const updatedBooking = await tx.rentalBooking.findUnique({
      where: { id: bookingId },
      select: myRentalBookingSelect,
    });

    if (!updatedBooking) {
      throw new HttpError(500, 'Rental booking was not updated');
    }

    return mapRentalBookingForUser(updatedBooking);
  });
}
