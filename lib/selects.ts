import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  telegramId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const publicCitySelect = {
  id: true,
  name: true,
} satisfies Prisma.CitySelect;

const participantRelationSelect = {
  id: true,
  userId: true,
  profileType: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserProfileSelect;

export const participantSummarySelect = {
  ...participantRelationSelect,
  birthDate: true,
  parentId: true,
  cityId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: publicUserSelect,
  },
  city: {
    select: publicCitySelect,
  },
} satisfies Prisma.UserProfileSelect;

export const participantDetailSelect = {
  ...participantSummarySelect,
  parent: {
    select: participantRelationSelect,
  },
  children: {
    select: participantRelationSelect,
  },
} satisfies Prisma.UserProfileSelect;

export const teamSelect = {
  id: true,
  name: true,
  cityId: true,
  createdAt: true,
  updatedAt: true,
  city: {
    select: publicCitySelect,
  },
  _count: {
    select: {
      members: true,
    },
  },
} satisfies Prisma.TeamSelect;

export const trainingSelect = {
  trainingId: true,
  name: true,
  description: true,
  trainingType: true,
  cityId: true,
  trainerId: true,
  startTime: true,
  endTime: true,
  location: true,
  capacity: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  city: {
    select: publicCitySelect,
  },
  trainer: {
    select: publicUserSelect,
  },
  _count: {
    select: {
      bookings: true,
    },
  },
} satisfies Prisma.SchoolTrainingSelect;

export const trainingBookingInclude = {
  participant: {
    select: participantSummarySelect,
  },
  training: {
    select: trainingSelect,
  },
} satisfies Prisma.TrainingBookingInclude;
