'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  canAccessAppPath,
  getRoleCapabilities,
  getVisibleAdminSections,
} from '@/lib/app-access';

type CitySummary = {
  id: number;
  name: string;
};

type PersonSummary = {
  id: number;
  profileType: string;
  firstName: string | null;
  lastName: string | null;
};

type ParticipantSummary = PersonSummary & {
  birthDate: string | null;
  city: CitySummary | null;
};

type CurrentUserSummary = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  staffRole: string | null;
  roles: string[];
  preferredCity: CitySummary | null;
  profile: PersonSummary | null;
};

type AdminTeamSummary = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  city: CitySummary | null;
  createdAt: string;
  updatedAt: string;
};

type AdminTeamMemberSummary = {
  id: number;
  team: {
    id: number;
    name: string;
    cityId: number | null;
    createdAt: string;
    updatedAt: string;
    city: CitySummary | null;
  };
  participant: (PersonSummary & {
    birthDate: string | null;
    city: CitySummary | null;
  }) | null;
  status: string;
  positionCode: string | null;
  jerseyNumber: number | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

type AdminTeamApplicationSummary = {
  id: number;
  status: string;
  commentFromApplicant: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  participant: (PersonSummary & {
    birthDate: string | null;
    city: CitySummary | null;
  }) | null;
  team: {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    city: CitySummary | null;
  };
  reviewedBy: {
    id: number;
    email: string | null;
    phone: string | null;
    telegramId: string | null;
  } | null;
};

type TrainerTeamApplicationSummary = {
  id: number;
  status: string;
  commentFromApplicant: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  participant: (PersonSummary & {
    birthDate: string | null;
    city: CitySummary | null;
  }) | null;
  team: {
    id: number;
    name: string;
    city: CitySummary | null;
  };
};

type AdminTrainingSummary = {
  id: number;
  name: string;
  trainingType: string;
  capacity: number;
  isActive: boolean;
  city: CitySummary;
  coach: {
    id: number;
    email: string | null;
    phone: string | null;
    telegramId: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type TrainerTrainingSummary = {
  trainingId: number;
  name: string;
  description: string | null;
  trainingType: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  isActive: boolean;
  city: CitySummary;
  trainer: {
    id: number;
    email: string | null;
    phone: string | null;
    telegramId: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    bookings: number;
  };
};

type AdminRentalBookingSummary = {
  id: number;
  status: string;
  bookingType: 'SELF' | 'PARTICIPANT';
  noteFromUser: string | null;
  managerNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string | null;
    phone: string | null;
    telegramId: string | null;
  };
  participant: (PersonSummary & {
    birthDate: string | null;
    city: CitySummary | null;
  }) | null;
  rentalSlot: {
    id: number;
    startsAt: string;
    endsAt: string;
    status: string;
    isPublic: boolean;
  };
  resource: {
    id: number;
    name: string;
    resourceType: string | null;
  };
  facility: {
    id: number;
    name: string;
  };
  city: CitySummary;
};

type AdminRentalSlotSummary = {
  id: number;
  status: string;
  startsAt: string;
  endsAt: string;
  visibleToPublic: boolean;
  resource: {
    id: number;
    name: string;
    resourceType: string | null;
  };
  facility: {
    id: number;
    name: string;
  };
  city: CitySummary;
  activeBookingSummary: {
    id: number;
    status: string;
    bookingType: 'SELF' | 'PARTICIPANT';
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      email: string | null;
      phone: string | null;
      telegramId: string | null;
    };
    participant: (PersonSummary & {
      birthDate: string | null;
      city: CitySummary | null;
    }) | null;
  } | null;
};

type AdminRentalFacilitySummary = {
  id: number;
  name: string;
  city: CitySummary;
  createdAt: string;
  updatedAt: string;
};

type AdminRentalResourceSummary = {
  id: number;
  name: string;
  type: string | null;
  facility: {
    id: number;
    name: string;
    city: CitySummary;
  };
  createdAt: string;
  updatedAt: string;
};

type AdminOverview = {
  participants: ParticipantSummary[];
  teams: AdminTeamSummary[];
  teamMembers: AdminTeamMemberSummary[];
  teamApplications: AdminTeamApplicationSummary[];
  trainings: AdminTrainingSummary[];
  rentalBookings: AdminRentalBookingSummary[];
  rentalSlots: AdminRentalSlotSummary[];
  rentalFacilities: AdminRentalFacilitySummary[];
  rentalResources: AdminRentalResourceSummary[];
};

type PageStatus = 'loading' | 'ready' | 'error';
type TeamApplicationStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';
type StaffManagedTeamApplicationStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

type TeamApplicationEditorState = {
  status: AdminTeamApplicationSummary['status'];
  internalNote: string;
};

type TeamApplicationFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type TeamFormMode = 'create' | 'edit';

type TeamEditorState = {
  name: string;
  slug: string;
  cityId: string;
  description: string;
};

type TeamFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type StaffManagedTeamMemberStatus = 'ACTIVE' | 'INJURED' | 'SUSPENDED';
type TeamMemberFormMode = 'create' | 'edit';

type TeamMemberEditorState = {
  participantId: string;
  teamId: string;
  status: StaffManagedTeamMemberStatus;
  positionCode: string;
  jerseyNumber: string;
  joinedAt: string;
};

type TeamMemberFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type TrainingActivityFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type TrainingFormMode = 'create' | 'edit';

type TrainingCoachOption = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
};

type TrainingEditorState = {
  name: string;
  cityId: string;
  coachId: string;
  trainingType: string;
  capacity: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
};

type TrainingFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type RentalBookingStatusFilter =
  | 'ALL'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CANCELLED';
type StaffManagedRentalBookingStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CANCELLED';

type RentalBookingEditorState = {
  status: StaffManagedRentalBookingStatus;
  managerNote: string;
};

type RentalBookingFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type RentalSlotStatusFilter = 'ALL' | 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
type StaffManagedRentalSlotStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
type RentalSlotFormMode = 'create' | 'edit';

type RentalSlotEditorState = {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  status: StaffManagedRentalSlotStatus;
  visibleToPublic: boolean;
};

type RentalSlotFeedback = {
  tone: 'success' | 'error';
  message: string;
};

type FetchResult<T> = {
  payload: T | { error?: string } | null;
  response: Response;
};

const roleLabels: Record<string, string> = {
  USER: 'Пользователь',
  COACH: 'Тренер',
  MANAGER: 'Менеджер',
  ADMIN: 'Администратор',
};

const trainingTypeLabels: Record<string, string> = {
  general: 'Общая',
  GENERAL: 'Общая',
  group: 'Групповая',
  GROUP: 'Групповая',
  private: 'Индивидуальная',
  PRIVATE: 'Индивидуальная',
  individual: 'Индивидуальная',
  INDIVIDUAL: 'Индивидуальная',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Активен',
  INJURED: 'Травма',
  SUSPENDED: 'Неактивен',
  PENDING: 'На рассмотрении',
  IN_REVIEW: 'В работе',
  ACCEPTED: 'Одобрено',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
  PENDING_CONFIRMATION: 'Ждёт подтверждения',
  CONFIRMED: 'Подтверждено',
  AVAILABLE: 'Доступно',
  BOOKED: 'Забронировано',
  UNAVAILABLE: 'Недоступно',
};

const teamApplicationFilterOptions: {
  value: TeamApplicationStatusFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Все статусы' },
  { value: 'PENDING', label: 'На рассмотрении' },
  { value: 'IN_REVIEW', label: 'В работе' },
  { value: 'ACCEPTED', label: 'Одобрено' },
  { value: 'REJECTED', label: 'Отклонено' },
  { value: 'CANCELLED', label: 'Отменено' },
];

const staffManagedTeamApplicationStatusOptions: {
  value: StaffManagedTeamApplicationStatus;
  label: string;
}[] = [
  { value: 'PENDING', label: 'На рассмотрении' },
  { value: 'IN_REVIEW', label: 'В работе' },
  { value: 'ACCEPTED', label: 'Одобрено' },
  { value: 'REJECTED', label: 'Отклонено' },
];

const staffManagedTeamMemberStatusOptions: {
  value: StaffManagedTeamMemberStatus;
  label: string;
}[] = [
  { value: 'ACTIVE', label: 'Активен' },
  { value: 'INJURED', label: 'Травма' },
  { value: 'SUSPENDED', label: 'Неактивен' },
];

const trainingActivityFilterOptions: {
  value: TrainingActivityFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Все тренировки' },
  { value: 'ACTIVE', label: 'Только активные' },
  { value: 'INACTIVE', label: 'Только неактивные' },
];

const rentalBookingFilterOptions: {
  value: RentalBookingStatusFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Все брони' },
  { value: 'PENDING_CONFIRMATION', label: 'Ждут подтверждения' },
  { value: 'CONFIRMED', label: 'Подтверждены' },
  { value: 'CANCELLED', label: 'Отменены' },
];

const staffManagedRentalBookingStatusOptions: {
  value: StaffManagedRentalBookingStatus;
  label: string;
}[] = [
  { value: 'PENDING_CONFIRMATION', label: 'Ждёт подтверждения' },
  { value: 'CONFIRMED', label: 'Подтверждено' },
  { value: 'CANCELLED', label: 'Отменено' },
];

const rentalSlotFilterOptions: {
  value: RentalSlotStatusFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Все слоты' },
  { value: 'AVAILABLE', label: 'Доступные' },
  { value: 'BOOKED', label: 'Забронированные' },
  { value: 'UNAVAILABLE', label: 'Недоступные' },
];

const createRentalSlotStatusOptions: {
  value: Extract<StaffManagedRentalSlotStatus, 'AVAILABLE' | 'UNAVAILABLE'>;
  label: string;
}[] = [
  { value: 'AVAILABLE', label: 'Доступно' },
  { value: 'UNAVAILABLE', label: 'Недоступно' },
];

const editableRentalSlotStatusOptions: {
  value: Extract<StaffManagedRentalSlotStatus, 'AVAILABLE' | 'UNAVAILABLE'>;
  label: string;
}[] = [
  { value: 'AVAILABLE', label: 'Доступно' },
  { value: 'UNAVAILABLE', label: 'Недоступно' },
];

function formatRoleList(roles: string[]) {
  if (roles.length === 0) {
    return 'Не указаны';
  }

  return roles.map((role) => roleLabels[role] ?? role).join(', ');
}

function formatProfileType(profileType: string | null) {
  switch (profileType) {
    case 'PLAYER':
      return 'Игрок';
    case 'CHILD':
      return 'Ребёнок';
    case 'PARENT':
      return 'Родитель';
    case 'ADULT':
      return 'Взрослый';
    default:
      return 'Профиль';
  }
}

function formatPersonName(person: PersonSummary | null) {
  if (!person) {
    return 'Профиль не указан';
  }

  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return fullName || formatProfileType(person.profileType);
}

function formatParticipantOptionLabel(
  participant:
    | (PersonSummary & { birthDate: string | null; city: CitySummary | null })
    | null
) {
  if (!participant) {
    return 'Участник не указан';
  }

  return `${formatPersonName(participant)}${
    participant.city ? ` / ${participant.city.name}` : ''
  }`;
}

function formatUserIdentity(user: {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
} | null) {
  if (!user) {
    return 'Пользователь не указан';
  }

  if (user.email) {
    return user.email;
  }

  if (user.telegramId) {
    return `@${user.telegramId}`;
  }

  if (user.phone) {
    return user.phone;
  }

  return `Пользователь #${user.id}`;
}

function createTeamApplicationEditorState(
  application: AdminTeamApplicationSummary
): TeamApplicationEditorState {
  return {
    status: ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'].includes(
      application.status
    )
      ? (application.status as StaffManagedTeamApplicationStatus)
      : 'PENDING',
    internalNote: application.internalNote ?? '',
  };
}

function toDateInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function toDateTimeLocalInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function createTeamEditorState(team?: AdminTeamSummary | null): TeamEditorState {
  if (team) {
    return {
      name: team.name,
      slug: team.slug ?? '',
      cityId: team.city ? String(team.city.id) : '',
      description: team.description ?? '',
    };
  }

  return {
    name: '',
    slug: '',
    cityId: '',
    description: '',
  };
}

function createTeamMemberEditorState(
  teamMember?: AdminTeamMemberSummary | null,
  defaultTeamId?: number | null
): TeamMemberEditorState {
  if (teamMember) {
    return {
      participantId: String(teamMember.participant?.id ?? ''),
      teamId: String(teamMember.team.id),
      status: ['ACTIVE', 'INJURED', 'SUSPENDED'].includes(teamMember.status)
        ? (teamMember.status as StaffManagedTeamMemberStatus)
        : 'ACTIVE',
      positionCode: teamMember.positionCode ?? '',
      jerseyNumber:
        teamMember.jerseyNumber !== null && teamMember.jerseyNumber !== undefined
          ? String(teamMember.jerseyNumber)
          : '',
      joinedAt: toDateInputValue(new Date(teamMember.joinedAt)),
    };
  }

  return {
    participantId: '',
    teamId: defaultTeamId ? String(defaultTeamId) : '',
    status: 'ACTIVE',
    positionCode: '',
    jerseyNumber: '',
    joinedAt: toDateInputValue(new Date()),
  };
}

function createTrainingEditorState(
  training?: AdminTrainingSummary | null
): TrainingEditorState {
  if (training) {
    return {
      name: training.name,
      cityId: String(training.city.id),
      coachId: training.coach ? String(training.coach.id) : '',
      trainingType: training.trainingType,
      capacity: String(training.capacity),
      isActive: training.isActive,
      startTime: '',
      endTime: '',
      location: '',
      description: '',
    };
  }

  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);
  startTime.setHours(19, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(20, 30, 0, 0);

  return {
    name: '',
    cityId: '',
    coachId: '',
    trainingType: 'general',
    capacity: '20',
    isActive: true,
    startTime: toDateTimeLocalInputValue(startTime),
    endTime: toDateTimeLocalInputValue(endTime),
    location: '',
    description: '',
  };
}

function createRentalBookingEditorState(
  booking: AdminRentalBookingSummary
): RentalBookingEditorState {
  return {
    status: ['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'].includes(
      booking.status
    )
      ? (booking.status as StaffManagedRentalBookingStatus)
      : 'PENDING_CONFIRMATION',
    managerNote: booking.managerNote ?? '',
  };
}

function createRentalSlotEditorState(
  slot?: AdminRentalSlotSummary | null
): RentalSlotEditorState {
  if (slot) {
    return {
      resourceId: String(slot.resource.id),
      startsAt: toDateTimeLocalInputValue(new Date(slot.startsAt)),
      endsAt: toDateTimeLocalInputValue(new Date(slot.endsAt)),
      status: ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'].includes(slot.status)
        ? (slot.status as StaffManagedRentalSlotStatus)
        : 'AVAILABLE',
      visibleToPublic: slot.visibleToPublic,
    };
  }

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(10, 0, 0, 0);

  const endsAt = new Date(startsAt);
  endsAt.setHours(11, 0, 0, 0);

  return {
    resourceId: '',
    startsAt: toDateTimeLocalInputValue(startsAt),
    endsAt: toDateTimeLocalInputValue(endsAt),
    status: 'AVAILABLE',
    visibleToPublic: true,
  };
}

function formatStatus(status: string) {
  return statusLabels[status] ?? status;
}

function formatTrainingType(trainingType: string) {
  return trainingTypeLabels[trainingType] ?? trainingType;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'ACCEPTED':
    case 'CONFIRMED':
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-700';
    case 'SUSPENDED':
    case 'REJECTED':
    case 'CANCELLED':
    case 'UNAVAILABLE':
      return 'bg-rose-100 text-rose-700';
    case 'IN_REVIEW':
    case 'BOOKED':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

const sharedDescriptionValidationErrorKey = 'description must be a string or null';
const sharedNameValidationErrorKey = 'name must be a non-empty string';

function translateErrorMessage(message: string) {
  const errorMessages: Record<string, string> = {
    'Failed to fetch current user': 'Не удалось определить текущего пользователя.',
    'Server error': 'Внутренняя ошибка сервера.',
    'Failed to fetch teams for staff': 'Не удалось загрузить список команд.',
    'Failed to fetch team members for staff':
      'Не удалось загрузить составы команд.',
    'Failed to fetch team applications for admin':
      'Не удалось загрузить заявки в команду.',
    'Failed to fetch team applications for staff':
      'Не удалось загрузить заявки в команду по тренерскому контуру.',
    'Failed to update team application':
      'Не удалось сохранить изменения по заявке.',
    'Failed to create team': 'Не удалось создать команду.',
    'Failed to update team': 'Не удалось сохранить изменения по команде.',
    'Failed to create team member': 'Не удалось добавить участника в состав.',
    'Failed to update team member':
      'Не удалось сохранить изменения по записи состава.',
    'Failed to fetch trainings for staff': 'Не удалось загрузить список тренировок.',
    'Failed to fetch trainings': 'Не удалось загрузить список тренировок.',
    'Failed to fetch users': 'Не удалось загрузить список пользователей для выбора тренера.',
    'Error retrieving cities': 'Не удалось загрузить список городов для тренировок.',
    'Failed to create training': 'Не удалось создать тренировку.',
    'Failed to update training': 'Не удалось сохранить изменения по тренировке.',
    'Failed to fetch rental bookings for staff':
      'Не удалось загрузить бронирования аренды.',
    'Failed to fetch rental slots for staff': 'Не удалось загрузить слоты аренды.',
    'Failed to fetch rental facilities for staff':
      'Не удалось загрузить площадки аренды.',
    'Failed to fetch rental resources for staff':
      'Не удалось загрузить ресурсы аренды.',
    'Failed to update rental booking':
      'Не удалось сохранить изменения по бронированию аренды.',
    'Failed to create rental slot': 'Не удалось создать слот аренды.',
    'Failed to update rental slot':
      'Не удалось сохранить изменения по слоту аренды.',
    'Current user is not authenticated': 'Пользователь не авторизован.',
    'Staff access required': 'Нужны staff-права для рабочего кабинета.',
    'Manager or admin access required':
      'Нужны права manager/admin для staff кабинета.',
    'At least one of status or internalNote is required':
      'Измените статус или внутреннюю заметку перед сохранением.',
    'status must be one of PENDING, IN_REVIEW, ACCEPTED, REJECTED':
      'Статус заявки должен быть одним из: PENDING, IN_REVIEW, ACCEPTED, REJECTED.',
    'internalNote must be a string or null':
      'Внутренняя заметка должна быть строкой или пустым значением.',
    'Invalid team application id': 'Некорректный идентификатор заявки.',
    'name, slug and cityId are required':
      'Для создания команды нужны name, slug и cityId.',
    [String(sharedDescriptionValidationErrorKey)]:
      'Описание команды должно быть строкой или пустым значением.',
    [String(sharedNameValidationErrorKey)]:
      'Название команды должно быть непустой строкой.',
    'slug must be a non-empty string':
      'Slug команды должен быть непустой строкой.',
    'Invalid team id': 'Некорректный идентификатор команды.',
    'At least one of name, slug, cityId or description is required':
      'Измените хотя бы одно поле команды перед сохранением.',
    'Team slug is already in use': 'Такой slug команды уже используется.',
    'Team not found': 'Команда не найдена.',
    'teamId must be a positive integer':
      'teamId должен быть положительным целым числом.',
    'participantId must be a positive integer':
      'participantId должен быть положительным целым числом.',
    'teamId, participantId and status are required':
      'Для записи состава нужны teamId, participantId и status.',
    'status must be one of ACTIVE, INJURED, SUSPENDED':
      'Статус состава должен быть одним из: ACTIVE, INJURED, SUSPENDED.',
    'positionCode must be a string or null':
      'positionCode должен быть строкой или пустым значением.',
    'jerseyNumber must be a positive integer or null':
      'Игровой номер должен быть положительным целым числом или пустым значением.',
    'joinedAt must be a valid date': 'Дата вступления указана некорректно.',
    'Invalid team member id': 'Некорректный идентификатор записи состава.',
    'At least one of status, positionCode, jerseyNumber or joinedAt is required':
      'Измените хотя бы одно поле записи состава перед сохранением.',
    'Participant not found': 'Участник не найден.',
    'Team member already exists': 'Такой участник уже есть в этой команде.',
    'Team member not found': 'Запись состава не найдена.',
    'status must be one of PENDING_CONFIRMATION, CONFIRMED, CANCELLED':
      'Статус брони должен быть одним из: PENDING_CONFIRMATION, CONFIRMED, CANCELLED.',
    'managerNote must be a string or null':
      'Manager note должен быть строкой или пустым значением.',
    'At least one of status or managerNote is required':
      'Измените статус брони или manager note перед сохранением.',
    'Invalid rental booking id':
      'Некорректный идентификатор бронирования аренды.',
    'Rental booking not found': 'Бронирование аренды не найдено.',
    'Rental booking is already cancelled': 'Это бронирование уже отменено.',
    'resourceId must be a positive integer':
      'Ресурс слота указан некорректно.',
    'startsAt must be a valid date': 'Время начала слота указано некорректно.',
    'endsAt must be a valid date': 'Время окончания слота указано некорректно.',
    'status must be one of AVAILABLE, BOOKED, UNAVAILABLE':
      'Статус слота должен быть одним из: AVAILABLE, BOOKED, UNAVAILABLE.',
    'visibleToPublic must be true or false':
      'Признак публичности слота должен быть true или false.',
    'resourceId, startsAt, endsAt, status and visibleToPublic are required':
      'Для создания слота нужны ресурс, время начала, время окончания, статус и признак публичности.',
    'Invalid rental slot id': 'Некорректный идентификатор слота аренды.',
    'At least one of status, startsAt, endsAt or visibleToPublic is required':
      'Измените хотя бы одно поле слота перед сохранением.',
    'Rental slot not found': 'Слот аренды не найден.',
    'Rental resource not found': 'Ресурс аренды не найден.',
    'Rental slot overlaps with an existing slot':
      'Слот пересекается с уже существующим интервалом для этого ресурса.',
    'Rental slot cannot be created as BOOKED without an active booking':
      'Нельзя создать слот со статусом BOOKED без активного бронирования.',
    'Rental slot cannot be set to BOOKED without an active booking':
      'Нельзя установить слоту статус BOOKED без активного бронирования.',
    'Rental slot with an active booking must stay BOOKED':
      'Слот с активным бронированием должен оставаться BOOKED.',
    'Rental slot is unavailable': 'Слот аренды сейчас недоступен.',
    'Rental slot is already booked': 'Слот аренды уже занят.',
    'name, cityId, startTime, endTime and location are required':
      'Для создания тренировки нужны название, город, время начала, время окончания и место.',
    [sharedDescriptionValidationErrorKey]:
      'Описание тренировки должно быть строкой или пустым значением.',
    'trainingType must be a string':
      'Тип тренировки должен быть строкой.',
    'coachId must be a positive integer':
      'Тренер должен быть корректным пользователем.',
    'coachId must be a positive integer or null':
      'Тренер должен быть корректным пользователем или пустым значением.',
    'capacity must be a positive integer':
      'Вместимость должна быть положительным целым числом.',
    'isActive must be true or false':
      'Признак активности должен быть true или false.',
    'endTime must be later than startTime':
      'Время окончания должно быть позже времени начала.',
    'Invalid training id': 'Некорректный идентификатор тренировки.',
    [sharedNameValidationErrorKey]:
      'Название тренировки должно быть непустой строкой.',
    'cityId must be a positive integer':
      'Город тренировки указан некорректно.',
    'At least one of name, cityId, coachId, trainingType, capacity or isActive is required':
      'Измените хотя бы одно поле тренировки перед сохранением.',
    'City not found': 'Выбранный город не найден.',
    'Coach not found': 'Выбранный тренер не найден.',
    'Training not found': 'Тренировка не найдена.',
    'Method not allowed': 'Метод не поддерживается.',
  };

  return errorMessages[message] ?? message;
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<FetchResult<T>> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null;

  return {
    response,
    payload,
  };
}

function normalizeTrainerApplication(
  application: TrainerTeamApplicationSummary
): AdminTeamApplicationSummary {
  return {
    ...application,
    team: {
      ...application.team,
      slug: null,
      description: null,
    },
    reviewedBy: null,
  };
}

function normalizeTrainerTraining(
  training: TrainerTrainingSummary
): AdminTrainingSummary {
  return {
    id: training.trainingId,
    name: training.name,
    trainingType: training.trainingType,
    capacity: training.capacity,
    isActive: training.isActive,
    city: training.city,
    coach: training.trainer,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
  };
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-stone-300/70 bg-white p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[24px] border border-stone-300/70 bg-white/95 p-5 shadow-[0_18px_45px_-35px_rgba(0,0,0,0.35)]">
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
    </article>
  );
}

type TeamsSectionContentProps = {
  totalTeamsCount: number;
  teamCityFilter: string;
  setTeamCityFilter: React.Dispatch<React.SetStateAction<string>>;
  teamFilterCityOptions: CitySummary[];
  teamCityOptions: CitySummary[];
  isTeamEditable: boolean;
  isTeamCreateMode: boolean;
  handleTeamCreateStart: () => void;
  handleTeamCreateCancel: () => void;
  filteredTeams: AdminTeamSummary[];
  activeTeamId: number | null;
  handleTeamSelect: (team: AdminTeamSummary) => void;
  teamFeedback: TeamFeedback | null;
  activeTeamEditor: TeamEditorState | null;
  selectedTeam: AdminTeamSummary | null;
  selectedTeamMembersCount: number;
  savingTeamKey: string | null;
  setTeamEditorId: React.Dispatch<React.SetStateAction<number | null>>;
  setTeamEditor: React.Dispatch<React.SetStateAction<TeamEditorState | null>>;
  setTeamFeedback: React.Dispatch<React.SetStateAction<TeamFeedback | null>>;
  handleTeamSave: () => void;
  isTeamCreateReady: boolean;
  isTeamDirty: boolean;
};

function TeamsSectionContent({
  totalTeamsCount,
  teamCityFilter,
  setTeamCityFilter,
  teamFilterCityOptions,
  teamCityOptions,
  isTeamEditable,
  isTeamCreateMode,
  handleTeamCreateStart,
  handleTeamCreateCancel,
  filteredTeams,
  activeTeamId,
  handleTeamSelect,
  teamFeedback,
  activeTeamEditor,
  selectedTeam,
  selectedTeamMembersCount,
  savingTeamKey,
  setTeamEditorId,
  setTeamEditor,
  setTeamFeedback,
  handleTeamSave,
  isTeamCreateReady,
  isTeamDirty,
}: TeamsSectionContentProps) {
  const selectedSavingKey = selectedTeam ? `edit-${selectedTeam.id}` : null;

  function updateCreateEditor(patch: Partial<TeamEditorState>) {
    setTeamEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTeamEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTeamFeedback(null);
  }

  function updateSelectedEditor(patch: Partial<TeamEditorState>) {
    if (!selectedTeam) {
      return;
    }

    setTeamEditorId(selectedTeam.id);
    setTeamEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTeamEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTeamFeedback(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="text-sm font-medium text-stone-700">
            Фильтр по городу
            <select
              value={teamCityFilter}
              onChange={(event) => {
                setTeamCityFilter(event.target.value);
                setTeamFeedback(null);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
            >
              <option value="ALL">Все города</option>
              {teamFilterCityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isTeamEditable ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTeamCreateStart}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Новая команда
            </button>
            {isTeamCreateMode ? (
              <button
                type="button"
                onClick={handleTeamCreateCancel}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              >
                Вернуться к списку
              </button>
            ) : null}
          </div>
        ) : null}

        {filteredTeams.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
            {totalTeamsCount === 0
              ? 'Команд пока нет.'
              : 'По текущему фильтру команд нет.'}
          </p>
        ) : (
          <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
            {filteredTeams.map((team) => {
              const isSelected = !isTeamCreateMode && team.id === activeTeamId;

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p
                        className={`mt-1 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {team.city?.name || 'Город не указан'}
                        {team.slug ? ` / ${team.slug}` : ''}
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        Обновлено: {formatDateTime(team.updatedAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isSelected
                          ? 'bg-white/15 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Команда #{team.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
        {teamFeedback ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              teamFeedback.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {teamFeedback.message}
          </p>
        ) : null}

        {activeTeamEditor && (isTeamCreateMode || selectedTeam) ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {isTeamCreateMode ? 'Новая команда' : `Команда #${selectedTeam?.id}`}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">
                  {isTeamCreateMode ? 'Создание команды' : selectedTeam?.name}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {isTeamCreateMode
                    ? 'POST создаёт новую команду в текущем staff-контуре.'
                    : `Участников в составе: ${selectedTeamMembersCount}.`}
                </p>
              </div>
              {!isTeamCreateMode && selectedTeam?.city ? (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                  {selectedTeam.city.name}
                </span>
              ) : null}
            </div>

            {!isTeamEditable ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Глобальное управление командами доступно только MANAGER и ADMIN.
              </p>
            ) : null}

            <div className="grid gap-4">
              <label className="text-sm font-medium text-stone-700">
                Название
                <input
                  value={activeTeamEditor.name}
                  onChange={(event) =>
                    isTeamCreateMode
                      ? updateCreateEditor({ name: event.target.value })
                      : updateSelectedEditor({ name: event.target.value })
                  }
                  disabled={
                    savingTeamKey === 'create' ||
                    savingTeamKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Slug
                <input
                  value={activeTeamEditor.slug}
                  onChange={(event) =>
                    isTeamCreateMode
                      ? updateCreateEditor({ slug: event.target.value })
                      : updateSelectedEditor({ slug: event.target.value })
                  }
                  disabled={
                    savingTeamKey === 'create' ||
                    savingTeamKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Город
                <select
                  value={activeTeamEditor.cityId}
                  onChange={(event) =>
                    isTeamCreateMode
                      ? updateCreateEditor({ cityId: event.target.value })
                      : updateSelectedEditor({ cityId: event.target.value })
                  }
                  disabled={
                    savingTeamKey === 'create' ||
                    savingTeamKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                >
                  <option value="">Выберите город</option>
                  {teamCityOptions.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-700">
                Описание
                <textarea
                  value={activeTeamEditor.description}
                  onChange={(event) =>
                    isTeamCreateMode
                      ? updateCreateEditor({ description: event.target.value })
                      : updateSelectedEditor({ description: event.target.value })
                  }
                  rows={5}
                  disabled={
                    savingTeamKey === 'create' ||
                    savingTeamKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>
            </div>

            {isTeamEditable ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                  {isTeamCreateMode
                    ? 'После создания новая команда сразу появляется в списке слева.'
                    : 'PATCH меняет name, slug, city и description без ручной перезагрузки.'}
                </p>
                <button
                  type="button"
                  onClick={handleTeamSave}
                  disabled={
                    isTeamCreateMode
                      ? !isTeamCreateReady || savingTeamKey === 'create'
                      : !isTeamDirty || savingTeamKey === selectedSavingKey
                  }
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isTeamCreateMode
                    ? savingTeamKey === 'create'
                      ? 'Создаём...'
                      : 'Создать команду'
                    : savingTeamKey === selectedSavingKey
                      ? 'Сохраняем...'
                      : 'Сохранить команду'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
            Выберите команду слева или создайте новую запись.
          </p>
        )}
      </div>
    </div>
  );
}

type TeamMembersSectionContentProps = {
  totalTeamMembersCount: number;
  teamMemberTeamFilter: string;
  setTeamMemberTeamFilter: React.Dispatch<React.SetStateAction<string>>;
  teamMemberTeamOptions: AdminTeamSummary[];
  filteredTeamMembers: AdminTeamMemberSummary[];
  activeTeamMemberId: number | null;
  handleTeamMemberSelect: (teamMember: AdminTeamMemberSummary) => void;
  isTeamEditable: boolean;
  isTeamMemberCreateMode: boolean;
  handleTeamMemberCreateStart: () => void;
  handleTeamMemberCreateCancel: () => void;
  teamMemberFeedback: TeamMemberFeedback | null;
  activeTeamMemberEditor: TeamMemberEditorState | null;
  availableParticipantOptions: (PersonSummary & {
    birthDate: string | null;
    city: CitySummary | null;
  })[];
  savingTeamMemberKey: string | null;
  setTeamMemberEditorId: React.Dispatch<React.SetStateAction<number | null>>;
  setTeamMemberEditor: React.Dispatch<
    React.SetStateAction<TeamMemberEditorState | null>
  >;
  setTeamMemberFeedback: React.Dispatch<
    React.SetStateAction<TeamMemberFeedback | null>
  >;
  handleTeamMemberSave: () => void;
  isTeamMemberCreateReady: boolean;
  selectedTeamMember: AdminTeamMemberSummary | null;
  isTeamMemberDirty: boolean;
};

function TeamMembersSectionContent({
  totalTeamMembersCount,
  teamMemberTeamFilter,
  setTeamMemberTeamFilter,
  teamMemberTeamOptions,
  filteredTeamMembers,
  activeTeamMemberId,
  handleTeamMemberSelect,
  isTeamEditable,
  isTeamMemberCreateMode,
  handleTeamMemberCreateStart,
  handleTeamMemberCreateCancel,
  teamMemberFeedback,
  activeTeamMemberEditor,
  availableParticipantOptions,
  savingTeamMemberKey,
  setTeamMemberEditorId,
  setTeamMemberEditor,
  setTeamMemberFeedback,
  handleTeamMemberSave,
  isTeamMemberCreateReady,
  selectedTeamMember,
  isTeamMemberDirty,
}: TeamMembersSectionContentProps) {
  const selectedSavingKey = selectedTeamMember
    ? `edit-${selectedTeamMember.id}`
    : null;

  function updateCreateEditor(patch: Partial<TeamMemberEditorState>) {
    setTeamMemberEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTeamMemberEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTeamMemberFeedback(null);
  }

  function updateSelectedEditor(patch: Partial<TeamMemberEditorState>) {
    if (!selectedTeamMember) {
      return;
    }

    setTeamMemberEditorId(selectedTeamMember.id);
    setTeamMemberEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTeamMemberEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTeamMemberFeedback(null);
  }

  function renderReadonlyValue(value: string) {
    return (
      <div className="mt-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800">
        {value}
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="text-sm font-medium text-stone-700">
            Фильтр по команде
            <select
              value={teamMemberTeamFilter}
              onChange={(event) => {
                setTeamMemberTeamFilter(event.target.value);
                setTeamMemberFeedback(null);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
            >
              <option value="ALL">Все команды</option>
              {teamMemberTeamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} / {team.city?.name || 'Город не указан'}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isTeamEditable ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTeamMemberCreateStart}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Добавить в состав
            </button>
            {isTeamMemberCreateMode ? (
              <button
                type="button"
                onClick={handleTeamMemberCreateCancel}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              >
                Вернуться к списку
              </button>
            ) : null}
          </div>
        ) : null}

        {filteredTeamMembers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
            {totalTeamMembersCount === 0
              ? 'Записей состава пока нет.'
              : 'По текущему фильтру записей состава нет.'}
          </p>
        ) : (
          <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
            {filteredTeamMembers.map((teamMember) => {
              const isSelected =
                !isTeamMemberCreateMode && teamMember.id === activeTeamMemberId;

              return (
                <button
                  key={teamMember.id}
                  type="button"
                  onClick={() => handleTeamMemberSelect(teamMember)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        {formatParticipantOptionLabel(teamMember.participant)}
                      </p>
                      <p
                        className={`mt-1 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {teamMember.team.name} /{' '}
                        {teamMember.team.city?.name || 'Город не указан'}
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        Позиция: {teamMember.positionCode || 'Не указана'} / №{' '}
                        {teamMember.jerseyNumber ?? '—'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isSelected
                          ? 'bg-white/15 text-white'
                          : getStatusBadgeClass(teamMember.status)
                      }`}
                    >
                      {formatStatus(teamMember.status)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
        {teamMemberFeedback ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              teamMemberFeedback.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {teamMemberFeedback.message}
          </p>
        ) : null}

        {activeTeamMemberEditor && (isTeamMemberCreateMode || selectedTeamMember) ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {isTeamMemberCreateMode
                    ? 'Новая запись состава'
                    : `Состав #${selectedTeamMember?.id}`}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">
                  {isTeamMemberCreateMode
                    ? 'Добавление участника'
                    : formatParticipantOptionLabel(selectedTeamMember?.participant ?? null)}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {isTeamMemberCreateMode
                    ? 'POST создаёт новую запись состава для выбранной команды.'
                    : `${selectedTeamMember?.team.name} / ${
                        selectedTeamMember?.team.city?.name || 'Город не указан'
                      }`}
                </p>
              </div>
              {!isTeamMemberCreateMode && selectedTeamMember ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                    selectedTeamMember.status
                  )}`}
                >
                  {formatStatus(selectedTeamMember.status)}
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">
                Участник
                {isTeamMemberCreateMode ? (
                  <select
                    value={activeTeamMemberEditor.participantId}
                    onChange={(event) =>
                      updateCreateEditor({ participantId: event.target.value })
                    }
                    disabled={savingTeamMemberKey === 'create'}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  >
                    <option value="">Выберите участника</option>
                    {availableParticipantOptions.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {formatParticipantOptionLabel(participant)}
                      </option>
                    ))}
                  </select>
                ) : (
                  renderReadonlyValue(
                    formatParticipantOptionLabel(selectedTeamMember?.participant ?? null)
                  )
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Команда
                {isTeamMemberCreateMode ? (
                  <select
                    value={activeTeamMemberEditor.teamId}
                    onChange={(event) =>
                      updateCreateEditor({ teamId: event.target.value })
                    }
                    disabled={savingTeamMemberKey === 'create'}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  >
                    <option value="">Выберите команду</option>
                    {teamMemberTeamOptions.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} / {team.city?.name || 'Город не указан'}
                      </option>
                    ))}
                  </select>
                ) : (
                  renderReadonlyValue(
                    `${selectedTeamMember?.team.name || 'Команда не указана'} / ${
                      selectedTeamMember?.team.city?.name || 'Город не указан'
                    }`
                  )
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Статус
                <select
                  value={activeTeamMemberEditor.status}
                  onChange={(event) =>
                    isTeamMemberCreateMode
                      ? updateCreateEditor({
                          status: event.target.value as StaffManagedTeamMemberStatus,
                        })
                      : updateSelectedEditor({
                          status: event.target.value as StaffManagedTeamMemberStatus,
                        })
                  }
                  disabled={
                    savingTeamMemberKey === 'create' ||
                    savingTeamMemberKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                >
                  {staffManagedTeamMemberStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-700">
                Позиция
                <input
                  value={activeTeamMemberEditor.positionCode}
                  onChange={(event) =>
                    isTeamMemberCreateMode
                      ? updateCreateEditor({ positionCode: event.target.value })
                      : updateSelectedEditor({ positionCode: event.target.value })
                  }
                  disabled={
                    savingTeamMemberKey === 'create' ||
                    savingTeamMemberKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Игровой номер
                <input
                  type="number"
                  min={1}
                  value={activeTeamMemberEditor.jerseyNumber}
                  onChange={(event) =>
                    isTeamMemberCreateMode
                      ? updateCreateEditor({ jerseyNumber: event.target.value })
                      : updateSelectedEditor({ jerseyNumber: event.target.value })
                  }
                  disabled={
                    savingTeamMemberKey === 'create' ||
                    savingTeamMemberKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Joined at
                <input
                  type="date"
                  value={activeTeamMemberEditor.joinedAt}
                  onChange={(event) =>
                    isTeamMemberCreateMode
                      ? updateCreateEditor({ joinedAt: event.target.value })
                      : updateSelectedEditor({ joinedAt: event.target.value })
                  }
                  disabled={
                    savingTeamMemberKey === 'create' ||
                    savingTeamMemberKey === selectedSavingKey
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>
            </div>

            {isTeamEditable ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                  {isTeamMemberCreateMode
                    ? 'После создания запись состава сразу появляется в списке слева.'
                    : 'PATCH меняет статус, позицию, номер и дату вступления без ручной перезагрузки.'}
                </p>
                <button
                  type="button"
                  onClick={handleTeamMemberSave}
                  disabled={
                    isTeamMemberCreateMode
                      ? !isTeamMemberCreateReady || savingTeamMemberKey === 'create'
                      : !isTeamMemberDirty ||
                        savingTeamMemberKey === selectedSavingKey
                  }
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isTeamMemberCreateMode
                    ? savingTeamMemberKey === 'create'
                      ? 'Сохраняем...'
                      : 'Добавить в состав'
                    : savingTeamMemberKey === selectedSavingKey
                      ? 'Сохраняем...'
                      : 'Сохранить запись'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
            Выберите запись состава слева или создайте новую.
          </p>
        )}
      </div>
    </div>
  );
}

type TrainingsSectionContentProps = {
  overview: AdminOverview;
  trainingActivityFilter: TrainingActivityFilter;
  setTrainingActivityFilter: React.Dispatch<
    React.SetStateAction<TrainingActivityFilter>
  >;
  trainingCityFilter: string;
  setTrainingCityFilter: React.Dispatch<React.SetStateAction<string>>;
  trainingFilterCityOptions: CitySummary[];
  isTrainingEditable: boolean;
  isTrainingCreateMode: boolean;
  handleTrainingCreateStart: () => void;
  handleTrainingCreateCancel: () => void;
  filteredTrainings: AdminTrainingSummary[];
  activeTrainingId: number | null;
  handleTrainingSelect: (training: AdminTrainingSummary) => void;
  trainingFeedback: TrainingFeedback | null;
  activeTrainingEditor: TrainingEditorState | null;
  trainingCityOptions: CitySummary[];
  trainingCoachOptions: TrainingCoachOption[];
  savingTrainingKey: string | null;
  setTrainingEditorId: React.Dispatch<React.SetStateAction<number | null>>;
  setTrainingEditor: React.Dispatch<
    React.SetStateAction<TrainingEditorState | null>
  >;
  setTrainingFeedback: React.Dispatch<
    React.SetStateAction<TrainingFeedback | null>
  >;
  handleTrainingSave: () => void;
  isTrainingCreateReady: boolean;
  selectedTraining: AdminTrainingSummary | null;
  isTrainingDirty: boolean;
};

type RentalsSectionContentProps = {
  overview: AdminOverview;
  isRentalOperationalEditable: boolean;
  pendingRentalBookingsCount: number;
  availablePublicSlotsCount: number;
  rentalBookingStatusFilter: RentalBookingStatusFilter;
  setRentalBookingStatusFilter: React.Dispatch<
    React.SetStateAction<RentalBookingStatusFilter>
  >;
  filteredRentalBookings: AdminRentalBookingSummary[];
  activeSelectedRentalBookingId: number | null;
  handleRentalBookingSelect: (booking: AdminRentalBookingSummary) => void;
  rentalBookingFeedback: RentalBookingFeedback | null;
  activeRentalBookingEditor: RentalBookingEditorState | null;
  selectedRentalBooking: AdminRentalBookingSummary | null;
  setRentalBookingEditorId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  setRentalBookingEditor: React.Dispatch<
    React.SetStateAction<RentalBookingEditorState | null>
  >;
  setRentalBookingFeedback: React.Dispatch<
    React.SetStateAction<RentalBookingFeedback | null>
  >;
  savingRentalBookingId: number | null;
  handleRentalBookingSave: () => void;
  isRentalBookingDirty: boolean;
  rentalSlotStatusFilter: RentalSlotStatusFilter;
  setRentalSlotStatusFilter: React.Dispatch<
    React.SetStateAction<RentalSlotStatusFilter>
  >;
  filteredRentalSlots: AdminRentalSlotSummary[];
  activeRentalSlotId: number | null;
  handleRentalSlotSelect: (slot: AdminRentalSlotSummary) => void;
  rentalSlotFeedback: RentalSlotFeedback | null;
  isRentalSlotCreateMode: boolean;
  handleRentalSlotCreateStart: () => void;
  handleRentalSlotCreateCancel: () => void;
  activeRentalSlotEditor: RentalSlotEditorState | null;
  rentalSlotResourceOptions: AdminRentalResourceSummary[];
  setRentalSlotEditorId: React.Dispatch<React.SetStateAction<number | null>>;
  setRentalSlotEditor: React.Dispatch<
    React.SetStateAction<RentalSlotEditorState | null>
  >;
  setRentalSlotFeedback: React.Dispatch<
    React.SetStateAction<RentalSlotFeedback | null>
  >;
  savingRentalSlotKey: string | null;
  handleRentalSlotSave: () => void;
  isRentalSlotCreateReady: boolean;
  selectedRentalSlot: AdminRentalSlotSummary | null;
  selectedRentalSlotHasActiveBooking: boolean;
  isRentalSlotDirty: boolean;
};

function TrainingsSectionContent({
  overview,
  trainingActivityFilter,
  setTrainingActivityFilter,
  trainingCityFilter,
  setTrainingCityFilter,
  trainingFilterCityOptions,
  isTrainingEditable,
  isTrainingCreateMode,
  handleTrainingCreateStart,
  handleTrainingCreateCancel,
  filteredTrainings,
  activeTrainingId,
  handleTrainingSelect,
  trainingFeedback,
  activeTrainingEditor,
  trainingCityOptions,
  trainingCoachOptions,
  savingTrainingKey,
  setTrainingEditorId,
  setTrainingEditor,
  setTrainingFeedback,
  handleTrainingSave,
  isTrainingCreateReady,
  selectedTraining,
  isTrainingDirty,
}: TrainingsSectionContentProps) {
  const selectedSavingKey = selectedTraining
    ? `edit-${selectedTraining.id}`
    : null;

  function updateCreateEditor(patch: Partial<TrainingEditorState>) {
    setTrainingEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTrainingEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTrainingFeedback(null);
  }

  function updateSelectedEditor(patch: Partial<TrainingEditorState>) {
    if (!selectedTraining) {
      return;
    }

    setTrainingEditorId(selectedTraining.id);
    setTrainingEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeTrainingEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setTrainingFeedback(null);
  }

  function renderReadonlyValue(value: string) {
    return (
      <div className="mt-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800">
        {value}
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="text-sm font-medium text-stone-700">
            Фильтр по активности
            <select
              value={trainingActivityFilter}
              onChange={(event) => {
                setTrainingActivityFilter(
                  event.target.value as TrainingActivityFilter
                );
                setTrainingFeedback(null);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
            >
              {trainingActivityFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-stone-700">
            Фильтр по городу
            <select
              value={trainingCityFilter}
              onChange={(event) => {
                setTrainingCityFilter(event.target.value);
                setTrainingFeedback(null);
              }}
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
            >
              <option value="ALL">Все города</option>
              {trainingFilterCityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isTrainingEditable ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTrainingCreateStart}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Новая тренировка
            </button>
            {isTrainingCreateMode ? (
              <button
                type="button"
                onClick={handleTrainingCreateCancel}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              >
                Вернуться к списку
              </button>
            ) : null}
          </div>
        ) : (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            В этом модуле TRAINER видит только свои тренировки. Глобальное
            создание и редактирование доступно только MANAGER и ADMIN.
          </p>
        )}

        {filteredTrainings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
            {overview.trainings.length === 0
              ? isTrainingEditable
                ? 'Тренировок пока нет. Создайте первую запись справа.'
                : 'Тренировок пока нет.'
              : 'По текущим фильтрам тренировок нет.'}
          </p>
        ) : (
          <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
            {filteredTrainings.map((training) => {
              const isSelected =
                !isTrainingCreateMode && training.id === activeTrainingId;

              return (
                <button
                  key={training.id}
                  type="button"
                  onClick={() => handleTrainingSelect(training)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{training.name}</p>
                      <p
                        className={`mt-1 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {training.city.name} /{' '}
                        {formatTrainingType(training.trainingType)}
                      </p>
                      <div
                        className={`mt-2 grid gap-1 text-sm ${
                          isSelected ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        <p>Тренер: {formatUserIdentity(training.coach)}</p>
                        <p>Вместимость: {training.capacity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : training.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {training.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                      <p
                        className={`text-xs ${
                          isSelected ? 'text-stone-400' : 'text-stone-500'
                        }`}
                      >
                        {formatDateTime(training.updatedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
        {trainingFeedback ? (
          <p
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              trainingFeedback.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {trainingFeedback.message}
          </p>
        ) : null}

        {isTrainingCreateMode && activeTrainingEditor ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Создание тренировки
                </p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">
                  Новая тренировка
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  По текущему API при создании нужно сразу задать время начала,
                  время окончания и место проведения.
                </p>
              </div>
              <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Черновик
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">
                Название
                <input
                  value={activeTrainingEditor.name}
                  onChange={(event) =>
                    updateCreateEditor({ name: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Город
                <select
                  value={activeTrainingEditor.cityId}
                  onChange={(event) =>
                    updateCreateEditor({ cityId: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                >
                  <option value="">Выберите город</option>
                  {trainingCityOptions.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-700">
                Тренер
                <select
                  value={activeTrainingEditor.coachId}
                  onChange={(event) =>
                    updateCreateEditor({ coachId: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                >
                  <option value="">Без закреплённого тренера</option>
                  {trainingCoachOptions.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {formatUserIdentity(coach)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-700">
                Тип тренировки
                <input
                  value={activeTrainingEditor.trainingType}
                  onChange={(event) =>
                    updateCreateEditor({ trainingType: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  placeholder="general / group / private"
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Вместимость
                <input
                  type="number"
                  min={1}
                  value={activeTrainingEditor.capacity}
                  onChange={(event) =>
                    updateCreateEditor({ capacity: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={activeTrainingEditor.isActive}
                  onChange={(event) =>
                    updateCreateEditor({ isActive: event.target.checked })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-stone-500"
                />
                Активна и доступна для записи
              </label>

              <label className="text-sm font-medium text-stone-700">
                Начало
                <input
                  type="datetime-local"
                  value={activeTrainingEditor.startTime}
                  onChange={(event) =>
                    updateCreateEditor({ startTime: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700">
                Окончание
                <input
                  type="datetime-local"
                  value={activeTrainingEditor.endTime}
                  onChange={(event) =>
                    updateCreateEditor({ endTime: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700 sm:col-span-2">
                Место проведения
                <input
                  value={activeTrainingEditor.location}
                  onChange={(event) =>
                    updateCreateEditor({ location: event.target.value })
                  }
                  disabled={savingTrainingKey === 'create'}
                  placeholder="Ледовая арена / зал / адрес"
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>

              <label className="text-sm font-medium text-stone-700 sm:col-span-2">
                Описание
                <textarea
                  value={activeTrainingEditor.description}
                  onChange={(event) =>
                    updateCreateEditor({ description: event.target.value })
                  }
                  rows={4}
                  disabled={savingTrainingKey === 'create'}
                  placeholder="Необязательное описание тренировки"
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-600">
                После сохранения новая тренировка сразу попадёт в общий список
                слева без ручной перезагрузки.
              </p>
              <button
                type="button"
                onClick={handleTrainingSave}
                disabled={
                  !isTrainingCreateReady || savingTrainingKey === 'create'
                }
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {savingTrainingKey === 'create'
                  ? 'Создаём...'
                  : 'Создать тренировку'}
              </button>
            </div>
          </div>
        ) : selectedTraining && activeTrainingEditor ? (
          <div className="space-y-5">
            {!isTrainingEditable ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Доступен только просмотр своих тренировок. Глобальное
                staff-редактирование здесь открыто только для MANAGER и ADMIN.
              </p>
            ) : null}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Тренировка #{selectedTraining.id}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">
                  {selectedTraining.name}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {selectedTraining.city.name} /{' '}
                  {formatUserIdentity(selectedTraining.coach)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedTraining.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {selectedTraining.isActive ? 'Активна' : 'Неактивна'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Создана
                </p>
                <p className="mt-2 text-sm text-stone-800">
                  {formatDateTime(selectedTraining.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Обновлена
                </p>
                <p className="mt-2 text-sm text-stone-800">
                  {formatDateTime(selectedTraining.updatedAt)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">
                Название
                {isTrainingEditable ? (
                  <input
                    value={activeTrainingEditor.name}
                    onChange={(event) =>
                      updateSelectedEditor({ name: event.target.value })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                ) : (
                  renderReadonlyValue(selectedTraining.name)
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Город
                {isTrainingEditable ? (
                  <select
                    value={activeTrainingEditor.cityId}
                    onChange={(event) =>
                      updateSelectedEditor({ cityId: event.target.value })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  >
                    <option value="">Выберите город</option>
                    {trainingCityOptions.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  renderReadonlyValue(selectedTraining.city.name)
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Тренер
                {isTrainingEditable ? (
                  <select
                    value={activeTrainingEditor.coachId}
                    onChange={(event) =>
                      updateSelectedEditor({ coachId: event.target.value })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  >
                    <option value="">Без закреплённого тренера</option>
                    {trainingCoachOptions.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {formatUserIdentity(coach)}
                      </option>
                    ))}
                  </select>
                ) : (
                  renderReadonlyValue(formatUserIdentity(selectedTraining.coach))
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Тип тренировки
                {isTrainingEditable ? (
                  <input
                    value={activeTrainingEditor.trainingType}
                    onChange={(event) =>
                      updateSelectedEditor({ trainingType: event.target.value })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    placeholder="general / group / private"
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                ) : (
                  renderReadonlyValue(
                    formatTrainingType(selectedTraining.trainingType)
                  )
                )}
              </label>

              <label className="text-sm font-medium text-stone-700">
                Вместимость
                {isTrainingEditable ? (
                  <input
                    type="number"
                    min={1}
                    value={activeTrainingEditor.capacity}
                    onChange={(event) =>
                      updateSelectedEditor({ capacity: event.target.value })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                ) : (
                  renderReadonlyValue(String(selectedTraining.capacity))
                )}
              </label>

              {isTrainingEditable ? (
                <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={activeTrainingEditor.isActive}
                    onChange={(event) =>
                      updateSelectedEditor({ isActive: event.target.checked })
                    }
                    disabled={savingTrainingKey === selectedSavingKey}
                    className="h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-stone-500"
                  />
                  Активна и доступна для записи
                </label>
              ) : (
                <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800">
                  {selectedTraining.isActive
                    ? 'Активна и доступна для записи'
                    : 'Неактивна и скрыта из активного потока'}
                </div>
              )}
            </div>

            {isTrainingEditable ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                  В этом модуле PATCH меняет название, город, тренера, тип,
                  вместимость и активность. Изменения сразу отражаются в списке
                  слева.
                </p>
                <button
                  type="button"
                  onClick={handleTrainingSave}
                  disabled={
                    !isTrainingDirty || savingTrainingKey === selectedSavingKey
                  }
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {savingTrainingKey === selectedSavingKey
                    ? 'Сохраняем...'
                    : 'Сохранить тренировку'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
            {isTrainingEditable
              ? 'Выберите тренировку слева или создайте новую запись.'
              : 'Выберите тренировку слева, чтобы открыть её данные.'}
          </p>
        )}
      </div>
    </div>
  );
}

function RentalsSectionContent({
  overview,
  isRentalOperationalEditable,
  pendingRentalBookingsCount,
  availablePublicSlotsCount,
  rentalBookingStatusFilter,
  setRentalBookingStatusFilter,
  filteredRentalBookings,
  activeSelectedRentalBookingId,
  handleRentalBookingSelect,
  rentalBookingFeedback,
  activeRentalBookingEditor,
  selectedRentalBooking,
  setRentalBookingEditorId,
  setRentalBookingEditor,
  setRentalBookingFeedback,
  savingRentalBookingId,
  handleRentalBookingSave,
  isRentalBookingDirty,
  rentalSlotStatusFilter,
  setRentalSlotStatusFilter,
  filteredRentalSlots,
  activeRentalSlotId,
  handleRentalSlotSelect,
  rentalSlotFeedback,
  isRentalSlotCreateMode,
  handleRentalSlotCreateStart,
  handleRentalSlotCreateCancel,
  activeRentalSlotEditor,
  rentalSlotResourceOptions,
  setRentalSlotEditorId,
  setRentalSlotEditor,
  setRentalSlotFeedback,
  savingRentalSlotKey,
  handleRentalSlotSave,
  isRentalSlotCreateReady,
  selectedRentalSlot,
  selectedRentalSlotHasActiveBooking,
  isRentalSlotDirty,
}: RentalsSectionContentProps) {
  const selectedRentalSlotSavingKey = selectedRentalSlot
    ? `edit-${selectedRentalSlot.id}`
    : null;

  function updateSelectedRentalBookingEditor(
    patch: Partial<RentalBookingEditorState>
  ) {
    if (!selectedRentalBooking) {
      return;
    }

    setRentalBookingEditorId(selectedRentalBooking.id);
    setRentalBookingEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeRentalBookingEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setRentalBookingFeedback(null);
  }

  function updateCreateRentalSlotEditor(patch: Partial<RentalSlotEditorState>) {
    setRentalSlotEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeRentalSlotEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setRentalSlotFeedback(null);
  }

  function updateSelectedRentalSlotEditor(
    patch: Partial<RentalSlotEditorState>
  ) {
    if (!selectedRentalSlot) {
      return;
    }

    setRentalSlotEditorId(selectedRentalSlot.id);
    setRentalSlotEditor((currentEditor) => {
      const baseEditor = currentEditor ?? activeRentalSlotEditor;
      return baseEditor ? { ...baseEditor, ...patch } : currentEditor;
    });
    setRentalSlotFeedback(null);
  }

  function renderReadonlyValue(value: string) {
    return (
      <div className="mt-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800">
        {value}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-stone-100 p-4">
          <p className="text-sm font-medium text-stone-500">Бронирования аренды</p>
          <div className="mt-3 grid gap-1 text-sm text-stone-700">
            <p>Всего: {overview!.rentalBookings.length}</p>
            <p>Ждут подтверждения: {pendingRentalBookingsCount}</p>
            <p>
              Подтверждено:{' '}
              {
                overview!.rentalBookings.filter(
                  (booking) => booking.status === 'CONFIRMED'
                ).length
              }
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-stone-100 p-4">
          <p className="text-sm font-medium text-stone-500">Слоты аренды</p>
          <div className="mt-3 grid gap-1 text-sm text-stone-700">
            <p>Всего: {overview!.rentalSlots.length}</p>
            <p>Публично доступны: {availablePublicSlotsCount}</p>
            <p>
              С активной бронью:{' '}
              {
                overview.rentalSlots.filter((slot) => slot.activeBookingSummary)
                  .length
              }
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-stone-100 p-4">
          <p className="text-sm font-medium text-stone-500">Инвентарь</p>
          <div className="mt-3 grid gap-1 text-sm text-stone-700">
            <p>Площадок: {overview!.rentalFacilities.length}</p>
            <p>Ресурсов: {overview!.rentalResources.length}</p>
            <p>
              Городов в аренде:{' '}
              {
                new Set(
                  overview!.rentalFacilities.map((facility) => facility.city.id)
                ).size
              }
            </p>
          </div>
        </div>
      </div>

      {!isRentalOperationalEditable ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          В этом модуле TRAINER не получает глобальное управление арендой.
          Операционные действия по броням и слотам доступны только MANAGER и
          ADMIN.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-sm font-medium text-stone-700">
              Фильтр бронирований
              <select
                value={rentalBookingStatusFilter}
                onChange={(event) => {
                  setRentalBookingStatusFilter(
                    event.target.value as RentalBookingStatusFilter
                  );
                  setRentalBookingFeedback(null);
                }}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
              >
                {rentalBookingFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredRentalBookings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              {overview!.rentalBookings.length === 0
                ? 'Бронирований аренды пока нет.'
                : 'По текущему фильтру бронирований нет.'}
            </p>
          ) : (
            <div className="space-y-3 xl:max-h-[660px] xl:overflow-y-auto xl:pr-2">
              {filteredRentalBookings.map((booking) => {
                const isSelected =
                  booking.id === activeSelectedRentalBookingId;

                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => handleRentalBookingSelect(booking)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {booking.resource.name} / {booking.facility.name}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? 'text-stone-300' : 'text-stone-600'
                          }`}
                        >
                          {booking.city.name}
                        </p>
                        <div
                          className={`mt-2 grid gap-1 text-sm ${
                            isSelected ? 'text-stone-300' : 'text-stone-700'
                          }`}
                        >
                          <p>{formatDateTime(booking.rentalSlot.startsAt)}</p>
                          <p>Заказчик: {formatUserIdentity(booking.user)}</p>
                          <p>
                            Формат:{' '}
                            {booking.bookingType === 'PARTICIPANT'
                              ? 'От лица участника'
                              : 'Самостоятельная аренда'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : getStatusBadgeClass(booking.status)
                        }`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-stone-200 bg-stone-50 p-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Бронирование
            </p>
            <h3 className="text-xl font-semibold text-stone-950">
              {selectedRentalBooking
                ? `Бронь #${selectedRentalBooking.id}`
                : 'Выберите бронирование слева'}
            </h3>
            <p className="text-sm leading-6 text-stone-600">
              Staff работает со статусом брони и manager note без ручного
              обновления страницы.
            </p>
          </div>

          {rentalBookingFeedback ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                rentalBookingFeedback.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {rentalBookingFeedback.message}
            </div>
          ) : null}

          {selectedRentalBooking && activeRentalBookingEditor ? (
            <div className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <p className="font-semibold text-stone-950">
                    {selectedRentalBooking.resource.name}
                  </p>
                  <p className="mt-1">
                    {selectedRentalBooking.facility.name} /{' '}
                    {selectedRentalBooking.city.name}
                  </p>
                  <p className="mt-2">
                    Слот: {formatDateTime(selectedRentalBooking.rentalSlot.startsAt)}{' '}
                    - {formatDateTime(selectedRentalBooking.rentalSlot.endsAt)}
                  </p>
                  <p className="mt-2">
                    Публичность:{' '}
                    {selectedRentalBooking.rentalSlot.isPublic
                      ? 'Видна в публичной аренде'
                      : 'Скрыта из публичной аренды'}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <p className="font-semibold text-stone-950">
                    Заказчик: {formatUserIdentity(selectedRentalBooking.user)}
                  </p>
                  <p className="mt-2">
                    Формат:{' '}
                    {selectedRentalBooking.bookingType === 'PARTICIPANT'
                      ? 'От лица участника'
                      : 'Самостоятельная аренда'}
                  </p>
                  <p className="mt-2">
                    Участник:{' '}
                    {selectedRentalBooking.participant
                      ? formatPersonName(selectedRentalBooking.participant)
                      : 'Не привязан'}
                  </p>
                  <p className="mt-2">
                    Обновлено: {formatDateTime(selectedRentalBooking.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-sm font-medium text-stone-700">
                    Комментарий пользователя
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    {selectedRentalBooking.noteFromUser?.trim() ||
                      'Пользователь не оставил комментарий.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <p className="font-medium text-stone-950">Таймлайн</p>
                  <p className="mt-2">
                    Создано: {formatDateTime(selectedRentalBooking.createdAt)}
                  </p>
                  <p className="mt-2">
                    Обновлено: {formatDateTime(selectedRentalBooking.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="text-sm font-medium text-stone-700">
                  Статус брони
                  {isRentalOperationalEditable ? (
                    <select
                      value={activeRentalBookingEditor.status}
                      onChange={(event) =>
                        updateSelectedRentalBookingEditor({
                          status: event.target
                            .value as StaffManagedRentalBookingStatus,
                        })
                      }
                      disabled={savingRentalBookingId === selectedRentalBooking.id}
                      className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                    >
                      {staffManagedRentalBookingStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    renderReadonlyValue(formatStatus(selectedRentalBooking.status))
                  )}
                </label>

                <label className="text-sm font-medium text-stone-700">
                  Manager note
                  {isRentalOperationalEditable ? (
                    <textarea
                      value={activeRentalBookingEditor.managerNote}
                      onChange={(event) =>
                        updateSelectedRentalBookingEditor({
                          managerNote: event.target.value,
                        })
                      }
                      rows={4}
                      disabled={savingRentalBookingId === selectedRentalBooking.id}
                      placeholder="Внутренняя заметка по бронированию"
                      className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                    />
                  ) : (
                    renderReadonlyValue(
                      selectedRentalBooking.managerNote?.trim() ||
                        'Внутренняя заметка пока не указана.'
                    )
                  )}
                </label>
              </div>

              {isRentalOperationalEditable ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-stone-600">
                    PATCH меняет статус и manager note. После сохранения список и
                    detail-часть синхронизируются без ручной перезагрузки.
                  </p>
                  <button
                    type="button"
                    onClick={handleRentalBookingSave}
                    disabled={
                      !isRentalBookingDirty ||
                      savingRentalBookingId === selectedRentalBooking.id
                    }
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {savingRentalBookingId === selectedRentalBooking.id
                      ? 'Сохраняем...'
                      : 'Сохранить бронирование'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
              Выберите бронирование слева, чтобы открыть данные и рабочие
              действия staff.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-sm font-medium text-stone-700">
              Фильтр слотов
              <select
                value={rentalSlotStatusFilter}
                onChange={(event) => {
                  setRentalSlotStatusFilter(
                    event.target.value as RentalSlotStatusFilter
                  );
                  setRentalSlotFeedback(null);
                }}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
              >
                {rentalSlotFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isRentalOperationalEditable ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRentalSlotCreateStart}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Новый слот аренды
              </button>
              {isRentalSlotCreateMode ? (
                <button
                  type="button"
                  onClick={handleRentalSlotCreateCancel}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                >
                  Вернуться к слотам
                </button>
              ) : null}
            </div>
          ) : null}

          {filteredRentalSlots.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              {overview!.rentalSlots.length === 0
                ? 'Слотов аренды пока нет.'
                : 'По текущему фильтру слотов нет.'}
            </p>
          ) : (
            <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
              {filteredRentalSlots.map((slot) => {
                const isSelected =
                  !isRentalSlotCreateMode && slot.id === activeRentalSlotId;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleRentalSlotSelect(slot)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {slot.resource.name} / {slot.facility.name}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? 'text-stone-300' : 'text-stone-600'
                          }`}
                        >
                          {slot.city.name}
                        </p>
                        <div
                          className={`mt-2 grid gap-1 text-sm ${
                            isSelected ? 'text-stone-300' : 'text-stone-700'
                          }`}
                        >
                          <p>
                            {formatDateTime(slot.startsAt)} -{' '}
                            {formatDateTime(slot.endsAt)}
                          </p>
                          <p>
                            {slot.visibleToPublic
                              ? 'Виден в публичной аренде'
                              : 'Скрыт из публичной аренды'}
                          </p>
                          <p>
                            {slot.activeBookingSummary
                              ? `Активная бронь #${slot.activeBookingSummary.id}`
                              : 'Активной брони нет'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : getStatusBadgeClass(slot.status)
                        }`}
                      >
                        {formatStatus(slot.status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-stone-200 bg-stone-50 p-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Слот аренды
            </p>
            <h3 className="text-xl font-semibold text-stone-950">
              {isRentalSlotCreateMode
                ? 'Создание нового слота'
                : selectedRentalSlot
                  ? `Слот #${selectedRentalSlot.id}`
                  : 'Выберите слот слева'}
            </h3>
            <p className="text-sm leading-6 text-stone-600">
              Staff управляет слотами через GET / POST / PATCH. Ресурс
              выбирается при создании, а дальше редактируются время, статус и
              публичность.
            </p>
          </div>

          {rentalSlotFeedback ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                rentalSlotFeedback.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {rentalSlotFeedback.message}
            </div>
          ) : null}

          {activeRentalSlotEditor &&
          (isRentalSlotCreateMode || selectedRentalSlot) ? (
            <div className="mt-5 space-y-5">
              {!isRentalSlotCreateMode && selectedRentalSlot ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                    <p className="font-semibold text-stone-950">
                      {selectedRentalSlot.resource.name}
                    </p>
                    <p className="mt-1">
                      {selectedRentalSlot.facility.name} /{' '}
                      {selectedRentalSlot.city.name}
                    </p>
                    <p className="mt-2">
                      Тип ресурса:{' '}
                      {selectedRentalSlot.resource.resourceType || 'Не указан'}
                    </p>
                    <p className="mt-2">
                      Окно слота: {formatDateTime(selectedRentalSlot.startsAt)} -{' '}
                      {formatDateTime(selectedRentalSlot.endsAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                    <p className="font-semibold text-stone-950">
                      Активная бронь
                    </p>
                    {selectedRentalSlot.activeBookingSummary ? (
                      <div className="mt-2 space-y-2">
                        <p>
                          #{selectedRentalSlot.activeBookingSummary.id} /{' '}
                          {formatStatus(
                            selectedRentalSlot.activeBookingSummary.status
                          )}
                        </p>
                        <p>
                          Заказчик:{' '}
                          {formatUserIdentity(
                            selectedRentalSlot.activeBookingSummary.user
                          )}
                        </p>
                        <p>
                          Участник:{' '}
                          {selectedRentalSlot.activeBookingSummary.participant
                            ? formatPersonName(
                                selectedRentalSlot.activeBookingSummary
                                  .participant
                              )
                            : 'Не привязан'}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2">Сейчас активной брони нет.</p>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-stone-700">
                  Ресурс аренды
                  {isRentalSlotCreateMode ? (
                    <select
                      value={activeRentalSlotEditor.resourceId}
                      onChange={(event) =>
                        updateCreateRentalSlotEditor({
                          resourceId: event.target.value,
                        })
                      }
                      disabled={savingRentalSlotKey === 'create'}
                      className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                    >
                      <option value="">Выберите ресурс</option>
                      {rentalSlotResourceOptions.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} / {resource.facility.name} /{' '}
                          {resource.facility.city.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    renderReadonlyValue(
                      selectedRentalSlot
                        ? `${selectedRentalSlot.resource.name} / ${selectedRentalSlot.facility.name} / ${selectedRentalSlot.city.name}`
                        : 'Ресурс не выбран'
                    )
                  )}
                </label>

                <label className="text-sm font-medium text-stone-700">
                  Статус слота
                  {isRentalOperationalEditable ? (
                    isRentalSlotCreateMode ? (
                      <select
                        value={activeRentalSlotEditor.status}
                        onChange={(event) =>
                          updateCreateRentalSlotEditor({
                            status: event.target
                              .value as StaffManagedRentalSlotStatus,
                          })
                        }
                        disabled={savingRentalSlotKey === 'create'}
                        className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                      >
                        {createRentalSlotStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : selectedRentalSlotHasActiveBooking ? (
                      <div className="mt-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                        У слота есть активная бронь, поэтому статус фиксирован
                        как BOOKED.
                      </div>
                    ) : (
                      <select
                        value={activeRentalSlotEditor.status}
                        onChange={(event) =>
                          updateSelectedRentalSlotEditor({
                            status: event.target
                              .value as StaffManagedRentalSlotStatus,
                          })
                        }
                        disabled={savingRentalSlotKey === selectedRentalSlotSavingKey}
                        className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                      >
                        {editableRentalSlotStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    renderReadonlyValue(
                      selectedRentalSlot
                        ? formatStatus(selectedRentalSlot.status)
                        : formatStatus(activeRentalSlotEditor.status)
                    )
                  )}
                </label>

                <label className="text-sm font-medium text-stone-700">
                  Время начала
                  <input
                    type="datetime-local"
                    value={activeRentalSlotEditor.startsAt}
                    onChange={(event) =>
                      isRentalSlotCreateMode
                        ? updateCreateRentalSlotEditor({
                            startsAt: event.target.value,
                          })
                        : updateSelectedRentalSlotEditor({
                            startsAt: event.target.value,
                          })
                    }
                    disabled={
                      savingRentalSlotKey === 'create' ||
                      savingRentalSlotKey === selectedRentalSlotSavingKey
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                </label>

                <label className="text-sm font-medium text-stone-700">
                  Время окончания
                  <input
                    type="datetime-local"
                    value={activeRentalSlotEditor.endsAt}
                    onChange={(event) =>
                      isRentalSlotCreateMode
                        ? updateCreateRentalSlotEditor({
                            endsAt: event.target.value,
                          })
                        : updateSelectedRentalSlotEditor({
                            endsAt: event.target.value,
                          })
                    }
                    disabled={
                      savingRentalSlotKey === 'create' ||
                      savingRentalSlotKey === selectedRentalSlotSavingKey
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={activeRentalSlotEditor.visibleToPublic}
                  onChange={(event) =>
                    isRentalSlotCreateMode
                      ? updateCreateRentalSlotEditor({
                          visibleToPublic: event.target.checked,
                        })
                      : updateSelectedRentalSlotEditor({
                          visibleToPublic: event.target.checked,
                        })
                  }
                  disabled={
                    savingRentalSlotKey === 'create' ||
                    savingRentalSlotKey === selectedRentalSlotSavingKey
                  }
                  className="h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-stone-500"
                />
                Показать слот в публичной аренде
              </label>

              {isRentalOperationalEditable ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-stone-600">
                    {isRentalSlotCreateMode
                      ? 'POST создаёт слот и сразу добавляет его в список слева.'
                      : 'PATCH обновляет время, статус и публичность слота без ручной перезагрузки.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleRentalSlotSave}
                    disabled={
                      isRentalSlotCreateMode
                        ? !isRentalSlotCreateReady ||
                          savingRentalSlotKey === 'create'
                        : !isRentalSlotDirty ||
                          savingRentalSlotKey === selectedRentalSlotSavingKey
                    }
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {isRentalSlotCreateMode
                      ? savingRentalSlotKey === 'create'
                        ? 'Создаём...'
                        : 'Создать слот'
                      : savingRentalSlotKey === selectedRentalSlotSavingKey
                        ? 'Сохраняем...'
                        : 'Сохранить слот'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
              {isRentalOperationalEditable
                ? 'Выберите слот слева или создайте новый, чтобы открыть рабочую форму.'
                : 'Выберите слот слева, чтобы открыть его данные.'}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-base font-semibold text-stone-950">
            Площадки аренды
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            В этой итерации staff видит инвентарь и использует его как контекст
            для слотов и бронирований.
          </p>
          <div className="mt-4 space-y-3">
            {overview!.rentalFacilities.map((facility) => {
              const resourcesCount = overview.rentalResources.filter(
                (resource) => resource.facility.id === facility.id
              ).length;
              const slotsCount = overview.rentalSlots.filter(
                (slot) => slot.facility.id === facility.id
              ).length;

              return (
                <div
                  key={facility.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700"
                >
                  <p className="font-semibold text-stone-950">{facility.name}</p>
                  <p className="mt-1">{facility.city.name}</p>
                  <p className="mt-2">
                    Ресурсов: {resourcesCount} / Слотов: {slotsCount}
                  </p>
                  <p className="mt-2 text-stone-500">
                    Обновлено: {formatDateTime(facility.updatedAt)}
                  </p>
                </div>
              );
            })}
            {overview!.rentalFacilities.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
                Площадок аренды пока нет.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-base font-semibold text-stone-950">
            Ресурсы аренды
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Ресурсы используются в качестве опорных сущностей для создания и
            редактирования слотов.
          </p>
          <div className="mt-4 space-y-3">
            {overview!.rentalResources.map((resource) => {
              const slotsCount = overview.rentalSlots.filter(
                (slot) => slot.resource.id === resource.id
              ).length;

              return (
                <div
                  key={resource.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700"
                >
                  <p className="font-semibold text-stone-950">{resource.name}</p>
                  <p className="mt-1">
                    {resource.facility.name} / {resource.facility.city.name}
                  </p>
                  <p className="mt-2">
                    Тип: {resource.type || 'Не указан'} / Слотов: {slotsCount}
                  </p>
                  <p className="mt-2 text-stone-500">
                    Обновлено: {formatDateTime(resource.updatedAt)}
                  </p>
                </div>
              );
            })}
            {overview!.rentalResources.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
                Ресурсов аренды пока нет.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [currentUser, setCurrentUser] = useState<CurrentUserSummary | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamCityFilter, setTeamCityFilter] = useState<string>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamEditorMode, setTeamEditorMode] = useState<TeamFormMode>('edit');
  const [teamEditorId, setTeamEditorId] = useState<number | null>(null);
  const [teamEditor, setTeamEditor] = useState<TeamEditorState | null>(null);
  const [teamFeedback, setTeamFeedback] = useState<TeamFeedback | null>(null);
  const [savingTeamKey, setSavingTeamKey] = useState<string | null>(null);
  const [teamMemberTeamFilter, setTeamMemberTeamFilter] = useState<string>('ALL');
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<number | null>(
    null
  );
  const [teamMemberEditorMode, setTeamMemberEditorMode] =
    useState<TeamMemberFormMode>('edit');
  const [teamMemberEditorId, setTeamMemberEditorId] = useState<number | null>(
    null
  );
  const [teamMemberEditor, setTeamMemberEditor] =
    useState<TeamMemberEditorState | null>(null);
  const [teamMemberFeedback, setTeamMemberFeedback] =
    useState<TeamMemberFeedback | null>(null);
  const [savingTeamMemberKey, setSavingTeamMemberKey] = useState<string | null>(
    null
  );
  const [teamApplicationStatusFilter, setTeamApplicationStatusFilter] =
    useState<TeamApplicationStatusFilter>('ALL');
  const [teamApplicationTeamFilter, setTeamApplicationTeamFilter] =
    useState<string>('ALL');
  const [selectedTeamApplicationId, setSelectedTeamApplicationId] = useState<
    number | null
  >(null);
  const [teamApplicationEditorId, setTeamApplicationEditorId] = useState<
    number | null
  >(null);
  const [teamApplicationEditor, setTeamApplicationEditor] =
    useState<TeamApplicationEditorState | null>(null);
  const [teamApplicationFeedback, setTeamApplicationFeedback] =
    useState<TeamApplicationFeedback | null>(null);
  const [savingTeamApplicationId, setSavingTeamApplicationId] = useState<
    number | null
  >(null);
  const [trainingCityOptions, setTrainingCityOptions] = useState<CitySummary[]>(
    []
  );
  const [trainingCoachOptions, setTrainingCoachOptions] = useState<
    TrainingCoachOption[]
  >([]);
  const [trainingActivityFilter, setTrainingActivityFilter] =
    useState<TrainingActivityFilter>('ALL');
  const [trainingCityFilter, setTrainingCityFilter] = useState<string>('ALL');
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(
    null
  );
  const [trainingEditorMode, setTrainingEditorMode] =
    useState<TrainingFormMode>('edit');
  const [trainingEditorId, setTrainingEditorId] = useState<number | null>(null);
  const [trainingEditor, setTrainingEditor] = useState<TrainingEditorState | null>(
    null
  );
  const [trainingFeedback, setTrainingFeedback] =
    useState<TrainingFeedback | null>(null);
  const [savingTrainingKey, setSavingTrainingKey] = useState<string | null>(null);
  const [rentalBookingStatusFilter, setRentalBookingStatusFilter] =
    useState<RentalBookingStatusFilter>('ALL');
  const [selectedRentalBookingId, setSelectedRentalBookingId] = useState<
    number | null
  >(null);
  const [rentalBookingEditorId, setRentalBookingEditorId] = useState<
    number | null
  >(null);
  const [rentalBookingEditor, setRentalBookingEditor] =
    useState<RentalBookingEditorState | null>(null);
  const [rentalBookingFeedback, setRentalBookingFeedback] =
    useState<RentalBookingFeedback | null>(null);
  const [savingRentalBookingId, setSavingRentalBookingId] = useState<
    number | null
  >(null);
  const [rentalSlotStatusFilter, setRentalSlotStatusFilter] =
    useState<RentalSlotStatusFilter>('ALL');
  const [selectedRentalSlotId, setSelectedRentalSlotId] = useState<number | null>(
    null
  );
  const [rentalSlotEditorMode, setRentalSlotEditorMode] =
    useState<RentalSlotFormMode>('edit');
  const [rentalSlotEditorId, setRentalSlotEditorId] = useState<number | null>(
    null
  );
  const [rentalSlotEditor, setRentalSlotEditor] =
    useState<RentalSlotEditorState | null>(null);
  const [rentalSlotFeedback, setRentalSlotFeedback] =
    useState<RentalSlotFeedback | null>(null);
  const [savingRentalSlotKey, setSavingRentalSlotKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadAdminOverview() {
      setStatus('loading');
      setError(null);

      const currentUserResult = await fetchJson<CurrentUserSummary>('/api/me');

      if (currentUserResult.response.status === 401) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      if (!currentUserResult.response.ok) {
        if (!isCancelled) {
          setStatus('error');
          setError(
            translateErrorMessage(
              (currentUserResult.payload as { error?: string } | null)?.error ||
                'Failed to fetch current user'
            )
          );
        }
        return;
      }

      const nextCurrentUser = currentUserResult.payload as CurrentUserSummary;
      const nextCurrentUserCapabilities = getRoleCapabilities(nextCurrentUser);

      if (!isCancelled) {
        setCurrentUser(nextCurrentUser);
      }

      if (!canAccessAppPath(nextCurrentUser, '/admin')) {
        router.replace('/cabinet');
        return;
      }

      if (nextCurrentUserCapabilities.isTrainer) {
        const [teamApplicationsResult, trainingsResult] = await Promise.all([
          fetchJson<TrainerTeamApplicationSummary[]>('/api/coach/team-applications'),
          fetchJson<TrainerTrainingSummary[]>(
            `/api/trainings?trainerId=${nextCurrentUser.id}&isActive=true`
          ),
        ]);

        const results = [teamApplicationsResult, trainingsResult];

        if (results.some((result) => result.response.status === 401)) {
          router.replace('/dev/login?next=/admin');
          return;
        }

        const failedResult = results.find((result) => !result.response.ok);

        if (failedResult) {
          const failedMessage = translateErrorMessage(
            (failedResult.payload as { error?: string } | null)?.error ||
              'Не удалось загрузить staff кабинет.'
          );

          if (!isCancelled) {
            setOverview(null);
            setStatus('error');
            setError(failedMessage);
          }

          return;
        }

        if (!isCancelled) {
          setTrainingCityOptions([]);
          setTrainingCoachOptions([]);
          setOverview({
            participants: [],
            teams: [],
            teamMembers: [],
            teamApplications: (
              teamApplicationsResult.payload as TrainerTeamApplicationSummary[]
            ).map(normalizeTrainerApplication),
            trainings: (trainingsResult.payload as TrainerTrainingSummary[]).map(
              normalizeTrainerTraining
            ),
            rentalBookings: [],
            rentalSlots: [],
            rentalFacilities: [],
            rentalResources: [],
          });
          setStatus('ready');
        }

        return;
      }

      const [
        teamsResult,
        teamMembersResult,
        teamApplicationsResult,
        trainingsResult,
        citiesResult,
        usersResult,
        participantsResult,
        rentalBookingsResult,
        rentalSlotsResult,
        rentalFacilitiesResult,
        rentalResourcesResult,
      ] = await Promise.all([
        fetchJson<AdminTeamSummary[]>('/api/admin/teams'),
        fetchJson<AdminTeamMemberSummary[]>('/api/admin/team-members'),
        fetchJson<AdminTeamApplicationSummary[]>('/api/admin/team-applications'),
        fetchJson<AdminTrainingSummary[]>('/api/admin/trainings'),
        fetchJson<CitySummary[]>('/api/city'),
        fetchJson<TrainingCoachOption[]>('/api/users'),
        fetchJson<ParticipantSummary[]>('/api/participants'),
        fetchJson<AdminRentalBookingSummary[]>('/api/admin/rental-bookings'),
        fetchJson<AdminRentalSlotSummary[]>('/api/admin/rental-slots'),
        fetchJson<AdminRentalFacilitySummary[]>('/api/admin/rental-facilities'),
        fetchJson<AdminRentalResourceSummary[]>('/api/admin/rental-resources'),
      ]);

      const results = [
        teamsResult,
        teamMembersResult,
        teamApplicationsResult,
        trainingsResult,
        citiesResult,
        usersResult,
        participantsResult,
        rentalBookingsResult,
        rentalSlotsResult,
        rentalFacilitiesResult,
        rentalResourcesResult,
      ];

      if (results.some((result) => result.response.status === 401)) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      const failedResult = results.find((result) => !result.response.ok);

      if (failedResult) {
        const failedMessage = translateErrorMessage(
          (failedResult.payload as { error?: string } | null)?.error ||
            'Не удалось загрузить staff кабинет.'
        );

        if (!isCancelled) {
          setOverview(null);
          setStatus('error');
          setError(failedMessage);
        }

        return;
      }

      if (!isCancelled) {
        setTrainingCityOptions(citiesResult.payload as CitySummary[]);
        setTrainingCoachOptions(usersResult.payload as TrainingCoachOption[]);
        setOverview({
          participants: participantsResult.payload as ParticipantSummary[],
          teams: teamsResult.payload as AdminTeamSummary[],
          teamMembers: teamMembersResult.payload as AdminTeamMemberSummary[],
          teamApplications:
            teamApplicationsResult.payload as AdminTeamApplicationSummary[],
          trainings: trainingsResult.payload as AdminTrainingSummary[],
          rentalBookings: rentalBookingsResult.payload as AdminRentalBookingSummary[],
          rentalSlots: rentalSlotsResult.payload as AdminRentalSlotSummary[],
          rentalFacilities:
            rentalFacilitiesResult.payload as AdminRentalFacilitySummary[],
          rentalResources:
            rentalResourcesResult.payload as AdminRentalResourceSummary[],
        });
        setStatus('ready');
      }
    }

    void loadAdminOverview();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const activeTrainingsCount =
    overview?.trainings.filter((training) => training.isActive).length ?? 0;
  const pendingApplicationsCount =
    overview?.teamApplications.filter((application) =>
      ['PENDING', 'IN_REVIEW'].includes(application.status)
    ).length ?? 0;
  const availablePublicSlotsCount =
    overview?.rentalSlots.filter(
      (slot) => slot.visibleToPublic && slot.status === 'AVAILABLE'
    ).length ?? 0;
  const pendingRentalBookingsCount =
    overview?.rentalBookings.filter(
      (booking) => booking.status === 'PENDING_CONFIRMATION'
    ).length ?? 0;
  const currentUserCapabilities = getRoleCapabilities(currentUser);
  const visibleAdminSections = getVisibleAdminSections(currentUserCapabilities);
  const visibleAdminSectionIds = new Set(
    visibleAdminSections.map((section) => section.id)
  );
  const isTeamEditable =
    currentUserCapabilities.isAdmin || currentUserCapabilities.isManager;
  const teamFilterCityOptions = Array.from(
    new Map(
      (overview?.teams ?? [])
        .filter((team) => team.city)
        .map((team) => [team.city!.id, team.city!])
    ).values()
  ).sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  const filteredTeams = (overview?.teams ?? [])
    .filter((team) => {
      if (teamCityFilter !== 'ALL' && String(team.city?.id) !== teamCityFilter) {
        return false;
      }

      return true;
    })
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  const selectedTeam =
    teamEditorMode === 'create'
      ? null
      : filteredTeams.find((team) => team.id === selectedTeamId) ??
        filteredTeams[0] ??
        null;
  const activeTeamId = selectedTeam?.id ?? null;
  const isTeamCreateMode = teamEditorMode === 'create';
  const activeTeamEditor = isTeamCreateMode
    ? teamEditor
    : selectedTeam && teamEditor !== null && teamEditorId === selectedTeam.id
      ? teamEditor
      : selectedTeam
        ? createTeamEditorState(selectedTeam)
        : null;
  const normalizedSelectedTeamName = selectedTeam?.name.trim() ?? '';
  const normalizedSelectedTeamSlug = selectedTeam?.slug?.trim() ?? '';
  const normalizedSelectedTeamDescription = selectedTeam?.description ?? '';
  const normalizedEditorTeamName = activeTeamEditor?.name.trim() ?? '';
  const normalizedEditorTeamSlug = activeTeamEditor?.slug.trim() ?? '';
  const normalizedEditorTeamDescription = activeTeamEditor?.description.trim() ?? '';
  const isTeamDirty =
    !isTeamCreateMode &&
    selectedTeam !== null &&
    activeTeamEditor !== null &&
    (normalizedSelectedTeamName !== normalizedEditorTeamName ||
      normalizedSelectedTeamSlug !== normalizedEditorTeamSlug ||
      String(selectedTeam.city?.id ?? '') !== activeTeamEditor.cityId ||
      normalizedSelectedTeamDescription !== normalizedEditorTeamDescription);
  const isTeamCreateReady =
    isTeamCreateMode &&
    activeTeamEditor !== null &&
    normalizedEditorTeamName.length > 0 &&
    normalizedEditorTeamSlug.length > 0 &&
    activeTeamEditor.cityId.length > 0;
  const selectedTeamMembersCount = selectedTeam
    ? (overview?.teamMembers ?? []).filter(
        (teamMember) => teamMember.team.id === selectedTeam.id
      ).length
    : 0;
  const teamMembersByUpdated = (overview?.teamMembers ?? [])
    .slice()
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  const teamMemberTeamOptions = (overview?.teams ?? [])
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  const filteredTeamMembers = teamMembersByUpdated.filter((teamMember) => {
    if (
      teamMemberTeamFilter !== 'ALL' &&
      String(teamMember.team.id) !== teamMemberTeamFilter
    ) {
      return false;
    }

    return true;
  });
  const selectedTeamMember =
    teamMemberEditorMode === 'create'
      ? null
      : filteredTeamMembers.find(
          (teamMember) => teamMember.id === selectedTeamMemberId
        ) ??
        filteredTeamMembers[0] ??
        null;
  const activeTeamMemberId = selectedTeamMember?.id ?? null;
  const isTeamMemberCreateMode = teamMemberEditorMode === 'create';
  const activeTeamMemberEditor = isTeamMemberCreateMode
    ? teamMemberEditor
    : selectedTeamMember &&
        teamMemberEditor !== null &&
          teamMemberEditorId === selectedTeamMember.id
      ? teamMemberEditor
      : selectedTeamMember
        ? createTeamMemberEditorState(selectedTeamMember)
        : null;
  const participantOptions = Array.from(
    new Map(
      [
        ...(overview?.participants ?? []),
        ...(overview?.teamMembers
          .map((teamMember) => teamMember.participant)
          .filter(
            (
              participant
            ): participant is ParticipantSummary => participant !== null
          ) ?? []),
        ...(overview?.teamApplications
          .map((application) => application.participant)
          .filter(
            (
              participant
            ): participant is ParticipantSummary => participant !== null
          ) ?? []),
        ...(overview?.rentalBookings
          .map((booking) => booking.participant)
          .filter(
            (
              participant
            ): participant is ParticipantSummary => participant !== null
          ) ?? []),
      ].map((participant) => [participant.id, participant])
    ).values()
  ).sort((left, right) =>
    formatPersonName(left).localeCompare(formatPersonName(right), 'ru')
  );
  const activeTeamMemberTargetTeamId = activeTeamMemberEditor?.teamId
    ? Number(activeTeamMemberEditor.teamId)
    : selectedTeamMember?.team.id ?? selectedTeam?.id ?? null;
  const availableParticipantOptions = participantOptions.filter((participant) => {
    if (!isTeamMemberCreateMode || !activeTeamMemberTargetTeamId) {
      return true;
    }

    return !(overview?.teamMembers ?? []).some(
      (teamMember) =>
        teamMember.team.id === activeTeamMemberTargetTeamId &&
        teamMember.participant?.id === participant.id
    );
  });
  const normalizedSelectedTeamMemberPositionCode =
    selectedTeamMember?.positionCode ?? '';
  const normalizedSelectedTeamMemberJerseyNumber =
    selectedTeamMember?.jerseyNumber !== null &&
    selectedTeamMember?.jerseyNumber !== undefined
      ? String(selectedTeamMember.jerseyNumber)
      : '';
  const normalizedSelectedTeamMemberJoinedAt = selectedTeamMember
    ? toDateInputValue(new Date(selectedTeamMember.joinedAt))
    : '';
  const normalizedEditorTeamMemberPositionCode =
    activeTeamMemberEditor?.positionCode.trim() ?? '';
  const normalizedEditorTeamMemberJerseyNumber =
    activeTeamMemberEditor?.jerseyNumber.trim() ?? '';
  const isTeamMemberDirty =
    !isTeamMemberCreateMode &&
    selectedTeamMember !== null &&
    activeTeamMemberEditor !== null &&
    (selectedTeamMember.status !== activeTeamMemberEditor.status ||
      normalizedSelectedTeamMemberPositionCode !==
        normalizedEditorTeamMemberPositionCode ||
      normalizedSelectedTeamMemberJerseyNumber !==
        normalizedEditorTeamMemberJerseyNumber ||
      normalizedSelectedTeamMemberJoinedAt !== activeTeamMemberEditor.joinedAt);
  const isTeamMemberCreateReady =
    isTeamMemberCreateMode &&
    activeTeamMemberEditor !== null &&
    activeTeamMemberEditor.participantId.length > 0 &&
    activeTeamMemberEditor.teamId.length > 0 &&
    activeTeamMemberEditor.joinedAt.length > 0;
  const teamCityCount = overview
    ? new Set(
        overview.teams
          .map((team) => team.city?.name)
          .filter((cityName): cityName is string => Boolean(cityName))
      ).size
    : 0;
  const summaryCards = [
    visibleAdminSectionIds.has('teams')
      ? {
          title: 'Команды',
          value: String(overview?.teams.length ?? 0),
          detail: `Городов в командах: ${teamCityCount}. Последнее обновление по данным staff API.`,
        }
      : null,
    visibleAdminSectionIds.has('teamApplications')
      ? {
          title: 'Заявки в команду',
          value: String(overview?.teamApplications.length ?? 0),
          detail:
            currentUserCapabilities.teamApplicationReviewScope === 'own'
              ? `По вашим командам новых и в работе: ${pendingApplicationsCount}.`
              : `Новых и в работе: ${pendingApplicationsCount}.`,
        }
      : null,
    visibleAdminSectionIds.has('trainings')
      ? {
          title: 'Тренировки',
          value: String(overview?.trainings.length ?? 0),
          detail:
            currentUserCapabilities.trainingManagementScope === 'own'
              ? `Активных ваших тренировок: ${activeTrainingsCount}.`
              : `Активных тренировок: ${activeTrainingsCount}.`,
        }
      : null,
    visibleAdminSectionIds.has('rentals')
      ? {
          title: 'Аренда',
          value: String(overview?.rentalBookings.length ?? 0),
          detail: `Ожидают подтверждения: ${pendingRentalBookingsCount}. Публичных доступных слотов: ${availablePublicSlotsCount}.`,
        }
      : null,
  ].filter(
    (
      card
    ): card is {
      title: string;
      value: string;
      detail: string;
    } => Boolean(card)
  );
  const responsibilitySummary =
    currentUserCapabilities.role === 'TRAINER'
      ? 'Отвечает только за свои тренировки и заявки по закреплённым командам.'
      : currentUserCapabilities.role === 'MANAGER'
        ? 'Отвечает за операционный staff-контур: команды, заявки, тренировки и аренду.'
        : 'Отвечает за полный staff/admin контур платформы и foundation под управление ролями.';
  const isTeamApplicationEditable =
    currentUserCapabilities.isAdmin || currentUserCapabilities.isManager;
  const teamApplicationTeamOptions = Array.from(
    new Map(
      (overview?.teamApplications ?? []).map((application) => [
        application.team.id,
        {
          id: application.team.id,
          name: application.team.name,
          cityName: application.team.city?.name ?? 'Город не указан',
        },
      ])
    ).values()
  ).sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  const filteredTeamApplications = (overview?.teamApplications ?? []).filter(
    (application) => {
      if (
        teamApplicationStatusFilter !== 'ALL' &&
        application.status !== teamApplicationStatusFilter
      ) {
        return false;
      }

      if (
        teamApplicationTeamFilter !== 'ALL' &&
        String(application.team.id) !== teamApplicationTeamFilter
      ) {
        return false;
      }

      return true;
    }
  );
  const selectedTeamApplication =
    filteredTeamApplications.find(
      (application) => application.id === selectedTeamApplicationId
    ) ??
    filteredTeamApplications[0] ??
    null;
  const activeSelectedTeamApplicationId = selectedTeamApplication?.id ?? null;
  const activeTeamApplicationEditor =
    selectedTeamApplication &&
    teamApplicationEditor !== null &&
    teamApplicationEditorId === selectedTeamApplication.id
      ? teamApplicationEditor
      : selectedTeamApplication
        ? createTeamApplicationEditorState(selectedTeamApplication)
        : null;
  const normalizedSelectedTeamApplicationNote =
    selectedTeamApplication?.internalNote ?? '';
  const normalizedEditorTeamApplicationNote =
    activeTeamApplicationEditor?.internalNote.trim() ?? '';
  const canEditSelectedTeamApplicationStatus =
    isTeamApplicationEditable &&
    selectedTeamApplication !== null &&
    selectedTeamApplication.status !== 'CANCELLED';
  const isTeamApplicationDirty =
    selectedTeamApplication !== null &&
    activeTeamApplicationEditor !== null &&
    (selectedTeamApplication.status !== activeTeamApplicationEditor.status ||
      normalizedSelectedTeamApplicationNote !== normalizedEditorTeamApplicationNote);
  const isTrainingEditable =
    currentUserCapabilities.isAdmin || currentUserCapabilities.isManager;
  const trainingFilterCityOptions = Array.from(
    new Map(
      (overview?.trainings ?? []).map((training) => [
        training.city.id,
        training.city,
      ])
    ).values()
  ).sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  const filteredTrainings = (overview?.trainings ?? [])
    .filter((training) => {
      if (trainingActivityFilter === 'ACTIVE' && !training.isActive) {
        return false;
      }

      if (trainingActivityFilter === 'INACTIVE' && training.isActive) {
        return false;
      }

      if (
        trainingCityFilter !== 'ALL' &&
        String(training.city.id) !== trainingCityFilter
      ) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return Number(right.isActive) - Number(left.isActive);
      }

      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    });
  const selectedTraining =
    trainingEditorMode === 'create'
      ? null
      : filteredTrainings.find((training) => training.id === selectedTrainingId) ??
        filteredTrainings[0] ??
        null;
  const activeTrainingId = selectedTraining?.id ?? null;
  const isTrainingCreateMode = trainingEditorMode === 'create';
  const activeTrainingEditor = isTrainingCreateMode
    ? trainingEditor
    : selectedTraining &&
        trainingEditor !== null &&
          trainingEditorId === selectedTraining.id
      ? trainingEditor
      : selectedTraining
        ? createTrainingEditorState(selectedTraining)
        : null;
  const normalizedSelectedTrainingName = selectedTraining?.name.trim() ?? '';
  const normalizedSelectedTrainingType =
    selectedTraining?.trainingType.trim() ?? '';
  const normalizedSelectedTrainingCapacity = selectedTraining
    ? String(selectedTraining.capacity)
    : '';
  const normalizedSelectedTrainingCoachId = selectedTraining?.coach
    ? String(selectedTraining.coach.id)
    : '';
  const normalizedEditorTrainingName = activeTrainingEditor?.name.trim() ?? '';
  const normalizedEditorTrainingType =
    activeTrainingEditor?.trainingType.trim() ?? '';
  const normalizedEditorTrainingCapacity =
    activeTrainingEditor?.capacity.trim() ?? '';
  const normalizedEditorTrainingCoachId =
    activeTrainingEditor?.coachId.trim() ?? '';
  const normalizedEditorTrainingLocation =
    activeTrainingEditor?.location.trim() ?? '';
  const isTrainingDirty =
    !isTrainingCreateMode &&
    selectedTraining !== null &&
    activeTrainingEditor !== null &&
    (normalizedSelectedTrainingName !== normalizedEditorTrainingName ||
      String(selectedTraining.city.id) !== activeTrainingEditor.cityId ||
      normalizedSelectedTrainingCoachId !== normalizedEditorTrainingCoachId ||
      normalizedSelectedTrainingType !== normalizedEditorTrainingType ||
      normalizedSelectedTrainingCapacity !== normalizedEditorTrainingCapacity ||
      selectedTraining.isActive !== activeTrainingEditor.isActive);
  const isTrainingCreateReady =
    isTrainingCreateMode &&
    activeTrainingEditor !== null &&
    normalizedEditorTrainingName.length > 0 &&
    activeTrainingEditor.cityId.length > 0 &&
    normalizedEditorTrainingType.length > 0 &&
    normalizedEditorTrainingCapacity.length > 0 &&
    activeTrainingEditor.startTime.length > 0 &&
    activeTrainingEditor.endTime.length > 0 &&
    normalizedEditorTrainingLocation.length > 0;
  const isRentalOperationalEditable =
    currentUserCapabilities.isAdmin || currentUserCapabilities.isManager;
  const filteredRentalBookings = (overview?.rentalBookings ?? [])
    .filter((booking) => {
      if (
        rentalBookingStatusFilter !== 'ALL' &&
        booking.status !== rentalBookingStatusFilter
      ) {
        return false;
      }

      return true;
    })
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  const selectedRentalBooking =
    filteredRentalBookings.find((booking) => booking.id === selectedRentalBookingId) ??
    filteredRentalBookings[0] ??
    null;
  const activeSelectedRentalBookingId = selectedRentalBooking?.id ?? null;
  const activeRentalBookingEditor =
    selectedRentalBooking &&
    rentalBookingEditor !== null &&
    rentalBookingEditorId === selectedRentalBooking.id
      ? rentalBookingEditor
      : selectedRentalBooking
        ? createRentalBookingEditorState(selectedRentalBooking)
        : null;
  const normalizedSelectedRentalManagerNote =
    selectedRentalBooking?.managerNote ?? '';
  const normalizedEditorRentalManagerNote =
    activeRentalBookingEditor?.managerNote.trim() ?? '';
  const isRentalBookingDirty =
    selectedRentalBooking !== null &&
    activeRentalBookingEditor !== null &&
    (selectedRentalBooking.status !== activeRentalBookingEditor.status ||
      normalizedSelectedRentalManagerNote !== normalizedEditorRentalManagerNote);
  const rentalSlotResourceOptions = (overview?.rentalResources ?? [])
    .slice()
    .sort((left, right) => {
      const leftLabel = `${left.name} ${left.facility.name} ${left.facility.city.name}`;
      const rightLabel = `${right.name} ${right.facility.name} ${right.facility.city.name}`;
      return leftLabel.localeCompare(rightLabel, 'ru');
    });
  const filteredRentalSlots = (overview?.rentalSlots ?? [])
    .filter((slot) => {
      if (rentalSlotStatusFilter !== 'ALL' && slot.status !== rentalSlotStatusFilter) {
        return false;
      }

      return true;
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
    );
  const selectedRentalSlot =
    rentalSlotEditorMode === 'create'
      ? null
      : filteredRentalSlots.find((slot) => slot.id === selectedRentalSlotId) ??
        filteredRentalSlots[0] ??
        null;
  const activeRentalSlotId = selectedRentalSlot?.id ?? null;
  const isRentalSlotCreateMode = rentalSlotEditorMode === 'create';
  const activeRentalSlotEditor = isRentalSlotCreateMode
    ? rentalSlotEditor
    : selectedRentalSlot &&
        rentalSlotEditor !== null &&
          rentalSlotEditorId === selectedRentalSlot.id
      ? rentalSlotEditor
      : selectedRentalSlot
        ? createRentalSlotEditorState(selectedRentalSlot)
        : null;
  const selectedRentalSlotHasActiveBooking =
    selectedRentalSlot?.activeBookingSummary !== null &&
    selectedRentalSlot?.activeBookingSummary !== undefined;
  const normalizedSelectedRentalSlotStartsAt = selectedRentalSlot
    ? toDateTimeLocalInputValue(new Date(selectedRentalSlot.startsAt))
    : '';
  const normalizedSelectedRentalSlotEndsAt = selectedRentalSlot
    ? toDateTimeLocalInputValue(new Date(selectedRentalSlot.endsAt))
    : '';
  const isRentalSlotDirty =
    !isRentalSlotCreateMode &&
    selectedRentalSlot !== null &&
    activeRentalSlotEditor !== null &&
    (normalizedSelectedRentalSlotStartsAt !== activeRentalSlotEditor.startsAt ||
      normalizedSelectedRentalSlotEndsAt !== activeRentalSlotEditor.endsAt ||
      selectedRentalSlot.status !== activeRentalSlotEditor.status ||
      selectedRentalSlot.visibleToPublic !== activeRentalSlotEditor.visibleToPublic);
  const isRentalSlotCreateReady =
    isRentalSlotCreateMode &&
    activeRentalSlotEditor !== null &&
    activeRentalSlotEditor.resourceId.length > 0 &&
    activeRentalSlotEditor.startsAt.length > 0 &&
    activeRentalSlotEditor.endsAt.length > 0;

  function handleTeamSelect(team: AdminTeamSummary) {
    setSelectedTeamId(team.id);
    setTeamEditorMode('edit');
    setTeamEditorId(team.id);
    setTeamEditor(createTeamEditorState(team));
    setTeamFeedback(null);
  }

  function handleTeamCreateStart() {
    setTeamEditorMode('create');
    setTeamEditorId(null);
    setTeamEditor(createTeamEditorState());
    setTeamFeedback(null);
  }

  function handleTeamCreateCancel() {
    setTeamEditorMode('edit');
    setTeamEditorId(selectedTeam?.id ?? null);
    setTeamEditor(selectedTeam ? createTeamEditorState(selectedTeam) : null);
    setTeamFeedback(null);
  }

  async function handleTeamSave() {
    if (!activeTeamEditor || !isTeamEditable) {
      return;
    }

    const nextDescription =
      activeTeamEditor.description.trim().length > 0
        ? activeTeamEditor.description.trim()
        : null;

    if (isTeamCreateMode) {
      const cityId = Number(activeTeamEditor.cityId);

      if (
        activeTeamEditor.name.trim().length === 0 ||
        activeTeamEditor.slug.trim().length === 0 ||
        !Number.isInteger(cityId) ||
        cityId <= 0
      ) {
        setTeamFeedback({
          tone: 'error',
          message: 'Укажите название, slug и город для новой команды.',
        });
        return;
      }

      setSavingTeamKey('create');
      setTeamFeedback(null);

      const createResult = await fetchJson<AdminTeamSummary>('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: activeTeamEditor.name.trim(),
          slug: activeTeamEditor.slug.trim(),
          cityId,
          description: nextDescription,
        }),
      });

      if (createResult.response.status === 401) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      if (!createResult.response.ok) {
        setSavingTeamKey(null);
        setTeamFeedback({
          tone: 'error',
          message: translateErrorMessage(
            (createResult.payload as { error?: string } | null)?.error ||
              'Failed to create team'
          ),
        });
        return;
      }

      const createdTeam = createResult.payload as AdminTeamSummary;

      setOverview((currentOverview) => {
        if (!currentOverview) {
          return currentOverview;
        }

        return {
          ...currentOverview,
          teams: [createdTeam, ...currentOverview.teams],
        };
      });
      setSelectedTeamId(createdTeam.id);
      setTeamEditorMode('edit');
      setTeamEditorId(createdTeam.id);
      setTeamEditor(createTeamEditorState(createdTeam));
      setSavingTeamKey(null);
      setTeamFeedback({
        tone: 'success',
        message: 'Команда создана и сразу добавлена в список.',
      });
      return;
    }

    if (!selectedTeam) {
      return;
    }

    const payload: {
      name?: string;
      slug?: string;
      cityId?: number;
      description?: string | null;
    } = {};

    if (normalizedSelectedTeamName !== normalizedEditorTeamName) {
      payload.name = activeTeamEditor.name.trim();
    }

    if (normalizedSelectedTeamSlug !== normalizedEditorTeamSlug) {
      payload.slug = activeTeamEditor.slug.trim();
    }

    if (String(selectedTeam.city?.id ?? '') !== activeTeamEditor.cityId) {
      const cityId = Number(activeTeamEditor.cityId);

      if (!Number.isInteger(cityId) || cityId <= 0) {
        setTeamFeedback({
          tone: 'error',
          message: 'Выберите корректный город команды.',
        });
        return;
      }

      payload.cityId = cityId;
    }

    if (normalizedSelectedTeamDescription !== normalizedEditorTeamDescription) {
      payload.description = nextDescription;
    }

    if (Object.keys(payload).length === 0) {
      setTeamFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingTeamKey(`edit-${selectedTeam.id}`);
    setTeamFeedback(null);

    const updateResult = await fetchJson<AdminTeamSummary>(
      `/api/admin/teams/${selectedTeam.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingTeamKey(null);
      setTeamFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update team'
        ),
      });
      return;
    }

    const updatedTeam = updateResult.payload as AdminTeamSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        teams: currentOverview.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
        teamMembers: currentOverview.teamMembers.map((teamMember) =>
          teamMember.team.id === updatedTeam.id
            ? {
                ...teamMember,
                team: {
                  ...teamMember.team,
                  name: updatedTeam.name,
                  cityId: updatedTeam.city?.id ?? null,
                  city: updatedTeam.city,
                },
              }
            : teamMember
        ),
      };
    });
    setSelectedTeamId(updatedTeam.id);
    setTeamEditorId(updatedTeam.id);
    setTeamEditorMode('edit');
    setTeamEditor(createTeamEditorState(updatedTeam));
    setSavingTeamKey(null);
    setTeamFeedback({
      tone: 'success',
      message: 'Команда сохранена. Изменения уже отражены в списке.',
    });
  }

  function handleTeamMemberSelect(teamMember: AdminTeamMemberSummary) {
    setSelectedTeamMemberId(teamMember.id);
    setTeamMemberEditorMode('edit');
    setTeamMemberEditorId(teamMember.id);
    setTeamMemberEditor(createTeamMemberEditorState(teamMember));
    setTeamMemberFeedback(null);
  }

  function handleTeamMemberCreateStart() {
    const defaultTeamId =
      selectedTeam?.id ??
      (teamMemberTeamFilter !== 'ALL' ? Number(teamMemberTeamFilter) : null);

    setTeamMemberEditorMode('create');
    setTeamMemberEditorId(null);
    setTeamMemberEditor(createTeamMemberEditorState(null, defaultTeamId));
    setTeamMemberFeedback(null);
  }

  function handleTeamMemberCreateCancel() {
    setTeamMemberEditorMode('edit');
    setTeamMemberEditorId(selectedTeamMember?.id ?? null);
    setTeamMemberEditor(
      selectedTeamMember ? createTeamMemberEditorState(selectedTeamMember) : null
    );
    setTeamMemberFeedback(null);
  }

  async function handleTeamMemberSave() {
    if (!activeTeamMemberEditor || !isTeamEditable) {
      return;
    }

    const nextPositionCode =
      activeTeamMemberEditor.positionCode.trim().length > 0
        ? activeTeamMemberEditor.positionCode.trim()
        : null;
    const nextJerseyNumber =
      activeTeamMemberEditor.jerseyNumber.trim().length > 0
        ? Number(activeTeamMemberEditor.jerseyNumber.trim())
        : null;
    const joinedAt = new Date(activeTeamMemberEditor.joinedAt);

    if (Number.isNaN(joinedAt.valueOf())) {
      setTeamMemberFeedback({
        tone: 'error',
        message: 'Укажите корректную дату вступления в состав.',
      });
      return;
    }

    if (
      nextJerseyNumber !== null &&
      (!Number.isInteger(nextJerseyNumber) || nextJerseyNumber <= 0)
    ) {
      setTeamMemberFeedback({
        tone: 'error',
        message: 'Игровой номер должен быть положительным целым числом.',
      });
      return;
    }

    if (isTeamMemberCreateMode) {
      const teamId = Number(activeTeamMemberEditor.teamId);
      const participantId = Number(activeTeamMemberEditor.participantId);

      if (
        !Number.isInteger(teamId) ||
        teamId <= 0 ||
        !Number.isInteger(participantId) ||
        participantId <= 0
      ) {
        setTeamMemberFeedback({
          tone: 'error',
          message: 'Выберите команду и участника для новой записи состава.',
        });
        return;
      }

      setSavingTeamMemberKey('create');
      setTeamMemberFeedback(null);

      const createResult = await fetchJson<AdminTeamMemberSummary>(
        '/api/admin/team-members',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId,
            participantId,
            status: activeTeamMemberEditor.status,
            positionCode: nextPositionCode,
            jerseyNumber: nextJerseyNumber,
            joinedAt: joinedAt.toISOString(),
          }),
        }
      );

      if (createResult.response.status === 401) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      if (!createResult.response.ok) {
        setSavingTeamMemberKey(null);
        setTeamMemberFeedback({
          tone: 'error',
          message: translateErrorMessage(
            (createResult.payload as { error?: string } | null)?.error ||
              'Failed to create team member'
          ),
        });
        return;
      }

      const createdTeamMember = createResult.payload as AdminTeamMemberSummary;

      setOverview((currentOverview) => {
        if (!currentOverview) {
          return currentOverview;
        }

        return {
          ...currentOverview,
          teamMembers: [createdTeamMember, ...currentOverview.teamMembers],
        };
      });
      setSelectedTeamMemberId(createdTeamMember.id);
      setTeamMemberEditorMode('edit');
      setTeamMemberEditorId(createdTeamMember.id);
      setTeamMemberEditor(createTeamMemberEditorState(createdTeamMember));
      setSavingTeamMemberKey(null);
      setTeamMemberFeedback({
        tone: 'success',
        message: 'Участник добавлен в состав и сразу появился в списке.',
      });
      return;
    }

    if (!selectedTeamMember) {
      return;
    }

    const payload: {
      status?: StaffManagedTeamMemberStatus;
      positionCode?: string | null;
      jerseyNumber?: number | null;
      joinedAt?: string;
    } = {};

    if (selectedTeamMember.status !== activeTeamMemberEditor.status) {
      payload.status = activeTeamMemberEditor.status;
    }

    if (
      normalizedSelectedTeamMemberPositionCode !==
      normalizedEditorTeamMemberPositionCode
    ) {
      payload.positionCode = nextPositionCode;
    }

    if (
      normalizedSelectedTeamMemberJerseyNumber !== normalizedEditorTeamMemberJerseyNumber
    ) {
      payload.jerseyNumber = nextJerseyNumber;
    }

    if (normalizedSelectedTeamMemberJoinedAt !== activeTeamMemberEditor.joinedAt) {
      payload.joinedAt = joinedAt.toISOString();
    }

    if (Object.keys(payload).length === 0) {
      setTeamMemberFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingTeamMemberKey(`edit-${selectedTeamMember.id}`);
    setTeamMemberFeedback(null);

    const updateResult = await fetchJson<AdminTeamMemberSummary>(
      `/api/admin/team-members/${selectedTeamMember.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingTeamMemberKey(null);
      setTeamMemberFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update team member'
        ),
      });
      return;
    }

    const updatedTeamMember = updateResult.payload as AdminTeamMemberSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        teamMembers: currentOverview.teamMembers.map((teamMember) =>
          teamMember.id === updatedTeamMember.id ? updatedTeamMember : teamMember
        ),
      };
    });
    setSelectedTeamMemberId(updatedTeamMember.id);
    setTeamMemberEditorMode('edit');
    setTeamMemberEditorId(updatedTeamMember.id);
    setTeamMemberEditor(createTeamMemberEditorState(updatedTeamMember));
    setSavingTeamMemberKey(null);
    setTeamMemberFeedback({
      tone: 'success',
      message: 'Запись состава сохранена. Изменения уже отражены в списке.',
    });
  }

  function handleTeamApplicationSelect(
    application: AdminTeamApplicationSummary
  ) {
    setSelectedTeamApplicationId(application.id);
    setTeamApplicationEditorId(application.id);
    setTeamApplicationEditor(createTeamApplicationEditorState(application));
    setTeamApplicationFeedback(null);
  }

  async function handleTeamApplicationSave() {
    if (
      !selectedTeamApplication ||
      !activeTeamApplicationEditor ||
      !isTeamApplicationEditable
    ) {
      return;
    }

    const nextInternalNote =
      activeTeamApplicationEditor.internalNote.trim().length > 0
        ? activeTeamApplicationEditor.internalNote.trim()
        : null;
    const payload: {
      status?: StaffManagedTeamApplicationStatus;
      internalNote?: string | null;
    } = {};

    if (
      selectedTeamApplication.status !== activeTeamApplicationEditor.status &&
      ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'].includes(
        activeTeamApplicationEditor.status
      )
    ) {
      payload.status =
        activeTeamApplicationEditor.status as StaffManagedTeamApplicationStatus;
    }

    if ((selectedTeamApplication.internalNote ?? null) !== nextInternalNote) {
      payload.internalNote = nextInternalNote;
    }

    if (Object.keys(payload).length === 0) {
      setTeamApplicationFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingTeamApplicationId(selectedTeamApplication.id);
    setTeamApplicationFeedback(null);

    const updateResult = await fetchJson<AdminTeamApplicationSummary>(
      `/api/admin/team-applications/${selectedTeamApplication.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingTeamApplicationId(null);
      setTeamApplicationFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update team application'
        ),
      });
      return;
    }

    const updatedApplication = updateResult.payload as AdminTeamApplicationSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        teamApplications: currentOverview.teamApplications.map((application) =>
          application.id === updatedApplication.id ? updatedApplication : application
        ),
      };
    });
    setSelectedTeamApplicationId(updatedApplication.id);
    setTeamApplicationEditorId(updatedApplication.id);
    setTeamApplicationEditor(createTeamApplicationEditorState(updatedApplication));
    setSavingTeamApplicationId(null);
    setTeamApplicationFeedback({
      tone: 'success',
      message: 'Заявка сохранена. Изменения уже отражены в списке.',
    });
  }

  function handleTrainingSelect(training: AdminTrainingSummary) {
    setSelectedTrainingId(training.id);
    setTrainingEditorMode('edit');
    setTrainingEditorId(training.id);
    setTrainingEditor(createTrainingEditorState(training));
    setTrainingFeedback(null);
  }

  function handleTrainingCreateStart() {
    setTrainingEditorMode('create');
    setTrainingEditorId(null);
    setTrainingEditor(createTrainingEditorState());
    setTrainingFeedback(null);
  }

  function handleTrainingCreateCancel() {
    setTrainingEditorMode('edit');
    setTrainingEditorId(selectedTraining?.id ?? null);
    setTrainingEditor(
      selectedTraining ? createTrainingEditorState(selectedTraining) : null
    );
    setTrainingFeedback(null);
  }

  async function handleTrainingSave() {
    if (!activeTrainingEditor || !isTrainingEditable) {
      return;
    }

    const name = activeTrainingEditor.name.trim();
    const cityId = Number(activeTrainingEditor.cityId);
    const coachId =
      activeTrainingEditor.coachId.trim().length > 0
        ? Number(activeTrainingEditor.coachId)
        : null;
    const trainingType = activeTrainingEditor.trainingType.trim();
    const capacity = Number(activeTrainingEditor.capacity);

    if (!name) {
      setTrainingFeedback({
        tone: 'error',
        message: 'Укажите название тренировки.',
      });
      return;
    }

    if (!Number.isInteger(cityId) || cityId <= 0) {
      setTrainingFeedback({
        tone: 'error',
        message: 'Выберите город тренировки.',
      });
      return;
    }

    if (
      coachId !== null &&
      (!Number.isInteger(coachId) || coachId <= 0)
    ) {
      setTrainingFeedback({
        tone: 'error',
        message: 'Выберите корректного тренера.',
      });
      return;
    }

    if (!trainingType) {
      setTrainingFeedback({
        tone: 'error',
        message: 'Укажите тип тренировки.',
      });
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setTrainingFeedback({
        tone: 'error',
        message: 'Вместимость должна быть положительным целым числом.',
      });
      return;
    }

    if (isTrainingCreateMode) {
      const location = activeTrainingEditor.location.trim();
      const description =
        activeTrainingEditor.description.trim().length > 0
          ? activeTrainingEditor.description.trim()
          : null;
      const startTime = new Date(activeTrainingEditor.startTime);
      const endTime = new Date(activeTrainingEditor.endTime);

      if (!location) {
        setTrainingFeedback({
          tone: 'error',
          message: 'Укажите место проведения тренировки.',
        });
        return;
      }

      if (
        Number.isNaN(startTime.valueOf()) ||
        Number.isNaN(endTime.valueOf())
      ) {
        setTrainingFeedback({
          tone: 'error',
          message: 'Укажите корректные дату и время начала и окончания.',
        });
        return;
      }

      if (endTime <= startTime) {
        setTrainingFeedback({
          tone: 'error',
          message: 'Время окончания должно быть позже времени начала.',
        });
        return;
      }

      setSavingTrainingKey('create');
      setTrainingFeedback(null);

      const createResult = await fetchJson<AdminTrainingSummary>(
        '/api/admin/trainings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cityId,
            coachId,
            trainingType,
            capacity,
            isActive: activeTrainingEditor.isActive,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            location,
            description,
          }),
        }
      );

      if (createResult.response.status === 401) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      if (!createResult.response.ok) {
        setSavingTrainingKey(null);
        setTrainingFeedback({
          tone: 'error',
          message: translateErrorMessage(
            (createResult.payload as { error?: string } | null)?.error ||
              'Failed to create training'
          ),
        });
        return;
      }

      const createdTraining = createResult.payload as AdminTrainingSummary;

      setOverview((currentOverview) => {
        if (!currentOverview) {
          return currentOverview;
        }

        return {
          ...currentOverview,
          trainings: [createdTraining, ...currentOverview.trainings],
        };
      });
      setSelectedTrainingId(createdTraining.id);
      setTrainingEditorMode('edit');
      setTrainingEditorId(createdTraining.id);
      setTrainingEditor(createTrainingEditorState(createdTraining));
      setSavingTrainingKey(null);
      setTrainingFeedback({
        tone: 'success',
        message:
          'Тренировка создана. Новая запись уже появилась в списке без ручной перезагрузки.',
      });
      return;
    }

    if (!selectedTraining) {
      return;
    }

    const payload: {
      name?: string;
      cityId?: number;
      coachId?: number | null;
      trainingType?: string;
      capacity?: number;
      isActive?: boolean;
    } = {};

    if (normalizedSelectedTrainingName !== name) {
      payload.name = name;
    }

    if (String(selectedTraining.city.id) !== activeTrainingEditor.cityId) {
      payload.cityId = cityId;
    }

    if (normalizedSelectedTrainingCoachId !== activeTrainingEditor.coachId.trim()) {
      payload.coachId = coachId;
    }

    if (normalizedSelectedTrainingType !== trainingType) {
      payload.trainingType = trainingType;
    }

    if (normalizedSelectedTrainingCapacity !== activeTrainingEditor.capacity.trim()) {
      payload.capacity = capacity;
    }

    if (selectedTraining.isActive !== activeTrainingEditor.isActive) {
      payload.isActive = activeTrainingEditor.isActive;
    }

    if (Object.keys(payload).length === 0) {
      setTrainingFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingTrainingKey(`edit-${selectedTraining.id}`);
    setTrainingFeedback(null);

    const updateResult = await fetchJson<AdminTrainingSummary>(
      `/api/admin/trainings/${selectedTraining.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingTrainingKey(null);
      setTrainingFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update training'
        ),
      });
      return;
    }

    const updatedTraining = updateResult.payload as AdminTrainingSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        trainings: currentOverview.trainings.map((training) =>
          training.id === updatedTraining.id ? updatedTraining : training
        ),
      };
    });
    setSelectedTrainingId(updatedTraining.id);
    setTrainingEditorMode('edit');
    setTrainingEditorId(updatedTraining.id);
    setTrainingEditor(createTrainingEditorState(updatedTraining));
    setSavingTrainingKey(null);
    setTrainingFeedback({
      tone: 'success',
      message:
        'Тренировка сохранена. Изменения уже отражены в списке без ручной перезагрузки.',
    });
  }

  function handleRentalBookingSelect(booking: AdminRentalBookingSummary) {
    setSelectedRentalBookingId(booking.id);
    setRentalBookingEditorId(booking.id);
    setRentalBookingEditor(createRentalBookingEditorState(booking));
    setRentalBookingFeedback(null);
  }

  async function handleRentalBookingSave() {
    if (
      !selectedRentalBooking ||
      !activeRentalBookingEditor ||
      !isRentalOperationalEditable
    ) {
      return;
    }

    const nextManagerNote =
      activeRentalBookingEditor.managerNote.trim().length > 0
        ? activeRentalBookingEditor.managerNote.trim()
        : null;
    const payload: {
      status?: StaffManagedRentalBookingStatus;
      managerNote?: string | null;
    } = {};

    if (selectedRentalBooking.status !== activeRentalBookingEditor.status) {
      payload.status = activeRentalBookingEditor.status;
    }

    if ((selectedRentalBooking.managerNote ?? null) !== nextManagerNote) {
      payload.managerNote = nextManagerNote;
    }

    if (Object.keys(payload).length === 0) {
      setRentalBookingFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingRentalBookingId(selectedRentalBooking.id);
    setRentalBookingFeedback(null);

    const updateResult = await fetchJson<AdminRentalBookingSummary>(
      `/api/admin/rental-bookings/${selectedRentalBooking.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingRentalBookingId(null);
      setRentalBookingFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update rental booking'
        ),
      });
      return;
    }

    const updatedBooking = updateResult.payload as AdminRentalBookingSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        rentalBookings: currentOverview.rentalBookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        ),
        rentalSlots: currentOverview.rentalSlots.map((slot) =>
          slot.id === updatedBooking.rentalSlot.id
            ? {
                ...slot,
                status: updatedBooking.rentalSlot.status,
                activeBookingSummary:
                  updatedBooking.status === 'CANCELLED'
                    ? null
                    : {
                        id: updatedBooking.id,
                        status: updatedBooking.status,
                        bookingType: updatedBooking.bookingType,
                        createdAt: updatedBooking.createdAt,
                        updatedAt: updatedBooking.updatedAt,
                        user: updatedBooking.user,
                        participant: updatedBooking.participant,
                      },
              }
            : slot
        ),
      };
    });
    setSelectedRentalBookingId(updatedBooking.id);
    setRentalBookingEditorId(updatedBooking.id);
    setRentalBookingEditor(createRentalBookingEditorState(updatedBooking));
    setSavingRentalBookingId(null);
    setRentalBookingFeedback({
      tone: 'success',
      message:
        'Бронирование сохранено. Статус и manager note уже отражены в интерфейсе.',
    });
  }

  function handleRentalSlotSelect(slot: AdminRentalSlotSummary) {
    setSelectedRentalSlotId(slot.id);
    setRentalSlotEditorMode('edit');
    setRentalSlotEditorId(slot.id);
    setRentalSlotEditor(createRentalSlotEditorState(slot));
    setRentalSlotFeedback(null);
  }

  function handleRentalSlotCreateStart() {
    setRentalSlotEditorMode('create');
    setRentalSlotEditorId(null);
    setRentalSlotEditor(createRentalSlotEditorState());
    setRentalSlotFeedback(null);
  }

  function handleRentalSlotCreateCancel() {
    setRentalSlotEditorMode('edit');
    setRentalSlotEditorId(selectedRentalSlot?.id ?? null);
    setRentalSlotEditor(
      selectedRentalSlot ? createRentalSlotEditorState(selectedRentalSlot) : null
    );
    setRentalSlotFeedback(null);
  }

  async function handleRentalSlotSave() {
    if (!activeRentalSlotEditor || !isRentalOperationalEditable) {
      return;
    }

    const startsAt = new Date(activeRentalSlotEditor.startsAt);
    const endsAt = new Date(activeRentalSlotEditor.endsAt);

    if (
      Number.isNaN(startsAt.valueOf()) ||
      Number.isNaN(endsAt.valueOf())
    ) {
      setRentalSlotFeedback({
        tone: 'error',
        message: 'Укажите корректные время начала и окончания слота.',
      });
      return;
    }

    if (endsAt <= startsAt) {
      setRentalSlotFeedback({
        tone: 'error',
        message: 'Время окончания должно быть позже времени начала.',
      });
      return;
    }

    if (isRentalSlotCreateMode) {
      const resourceId = Number(activeRentalSlotEditor.resourceId);

      if (!Number.isInteger(resourceId) || resourceId <= 0) {
        setRentalSlotFeedback({
          tone: 'error',
          message: 'Выберите ресурс аренды для нового слота.',
        });
        return;
      }

      setSavingRentalSlotKey('create');
      setRentalSlotFeedback(null);

      const createResult = await fetchJson<AdminRentalSlotSummary>(
        '/api/admin/rental-slots',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resourceId,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            status:
              activeRentalSlotEditor.status === 'BOOKED'
                ? 'AVAILABLE'
                : activeRentalSlotEditor.status,
            visibleToPublic: activeRentalSlotEditor.visibleToPublic,
          }),
        }
      );

      if (createResult.response.status === 401) {
        router.replace('/dev/login?next=/admin');
        return;
      }

      if (!createResult.response.ok) {
        setSavingRentalSlotKey(null);
        setRentalSlotFeedback({
          tone: 'error',
          message: translateErrorMessage(
            (createResult.payload as { error?: string } | null)?.error ||
              'Failed to create rental slot'
          ),
        });
        return;
      }

      const createdSlot = createResult.payload as AdminRentalSlotSummary;

      setOverview((currentOverview) => {
        if (!currentOverview) {
          return currentOverview;
        }

        return {
          ...currentOverview,
          rentalSlots: [createdSlot, ...currentOverview.rentalSlots],
        };
      });
      setSelectedRentalSlotId(createdSlot.id);
      setRentalSlotEditorMode('edit');
      setRentalSlotEditorId(createdSlot.id);
      setRentalSlotEditor(createRentalSlotEditorState(createdSlot));
      setSavingRentalSlotKey(null);
      setRentalSlotFeedback({
        tone: 'success',
        message:
          'Слот создан. Новая запись уже появилась в списке без ручной перезагрузки.',
      });
      return;
    }

    if (!selectedRentalSlot) {
      return;
    }

    const payload: {
      status?: StaffManagedRentalSlotStatus;
      startsAt?: string;
      endsAt?: string;
      visibleToPublic?: boolean;
    } = {};

    if (
      !selectedRentalSlotHasActiveBooking &&
      selectedRentalSlot.status !== activeRentalSlotEditor.status
    ) {
      payload.status = activeRentalSlotEditor.status;
    }

    if (normalizedSelectedRentalSlotStartsAt !== activeRentalSlotEditor.startsAt) {
      payload.startsAt = startsAt.toISOString();
    }

    if (normalizedSelectedRentalSlotEndsAt !== activeRentalSlotEditor.endsAt) {
      payload.endsAt = endsAt.toISOString();
    }

    if (
      selectedRentalSlot.visibleToPublic !== activeRentalSlotEditor.visibleToPublic
    ) {
      payload.visibleToPublic = activeRentalSlotEditor.visibleToPublic;
    }

    if (Object.keys(payload).length === 0) {
      setRentalSlotFeedback({
        tone: 'success',
        message: 'Изменений для сохранения нет.',
      });
      return;
    }

    setSavingRentalSlotKey(`edit-${selectedRentalSlot.id}`);
    setRentalSlotFeedback(null);

    const updateResult = await fetchJson<AdminRentalSlotSummary>(
      `/api/admin/rental-slots/${selectedRentalSlot.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResult.response.status === 401) {
      router.replace('/dev/login?next=/admin');
      return;
    }

    if (!updateResult.response.ok) {
      setSavingRentalSlotKey(null);
      setRentalSlotFeedback({
        tone: 'error',
        message: translateErrorMessage(
          (updateResult.payload as { error?: string } | null)?.error ||
            'Failed to update rental slot'
        ),
      });
      return;
    }

    const updatedSlot = updateResult.payload as AdminRentalSlotSummary;

    setOverview((currentOverview) => {
      if (!currentOverview) {
        return currentOverview;
      }

      return {
        ...currentOverview,
        rentalSlots: currentOverview.rentalSlots.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot
        ),
      };
    });
    setSelectedRentalSlotId(updatedSlot.id);
    setRentalSlotEditorMode('edit');
    setRentalSlotEditorId(updatedSlot.id);
    setRentalSlotEditor(createRentalSlotEditorState(updatedSlot));
    setSavingRentalSlotKey(null);
    setRentalSlotFeedback({
      tone: 'success',
      message:
        'Слот сохранён. Изменения уже отражены в списке без ручной перезагрузки.',
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#ede6d8_45%,#e4ddcf_100%)] px-4 py-8 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[30px] border border-stone-300/70 bg-[#171411] px-6 py-7 text-stone-100 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                Staff / admin
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Staff/admin кабинет
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                Рабочая зона staff с role-aware доступом к командам, заявкам,
                тренировкам и аренде.
              </p>
              {currentUser ? (
                <p className="mt-3 text-sm text-stone-300">
                  Текущий пользователь: {formatPersonName(currentUser.profile)}. Роли:{' '}
                  {formatRoleList(currentUser.roles)}. Платформенная роль:{' '}
                  {currentUserCapabilities.roleLabel}. Уровень доступа:{' '}
                  {currentUserCapabilities.adminAccessLabel}. Основной рабочий маршрут:{' '}
                  {currentUserCapabilities.primaryEntryPath}.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/cabinet"
                className="rounded-full border border-stone-600 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-300 hover:text-white"
              >
                Пользовательский кабинет
              </Link>
              <Link
                href="/dev/login"
                className="rounded-full border border-stone-600 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-300 hover:text-white"
              >
                Сменить пользователя
              </Link>
            </div>
          </div>
        </header>

        {status === 'loading' ? (
          <section className="rounded-[28px] border border-stone-300/70 bg-white/90 p-6 text-sm text-stone-600 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            Проверяем доступ и загружаем staff/admin обзор...
          </section>
        ) : null}

        {status === 'error' ? (
          <section className="rounded-[28px] border border-rose-300 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            {error}
          </section>
        ) : null}

        {status === 'ready' && overview && currentUser ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-[28px] border border-stone-300/70 bg-white p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Role-native workspace
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    {currentUserCapabilities.accessBadge}
                  </span>
                  <span className="text-sm font-medium text-stone-600">
                    {currentUserCapabilities.adminAccessLabel}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                  /admin является рабочей зоной роли{' '}
                  {currentUserCapabilities.roleLabel}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-700">
                  {currentUserCapabilities.adminDescription}
                </p>
              </article>

              <article className="rounded-[28px] border border-stone-300/70 bg-white p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
                <p className="text-sm font-medium text-stone-500">
                  Role / access summary
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-stone-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                      Текущая роль
                    </p>
                    <p className="mt-2 text-base font-semibold text-stone-950">
                      {currentUserCapabilities.roleLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                      Уровень доступа
                    </p>
                    <p className="mt-2 text-base font-semibold text-stone-950">
                      {currentUserCapabilities.adminAccessLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                      Рабочий маршрут
                    </p>
                    <p className="mt-2 text-base font-semibold text-stone-950">
                      {currentUserCapabilities.primaryEntryPath}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-700">
                  {responsibilitySummary}
                </p>
                {visibleAdminSections.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleAdminSections.map((section) => (
                      <span
                        key={section.id}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                      >
                        {section.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </section>

            {summaryCards.length > 0 ? (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <SummaryCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    detail={card.detail}
                  />
                ))}
              </section>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-2">
              {visibleAdminSectionIds.has('teams') ? (
                <SectionCard
                  title="Команды"
                  description={
                    isTeamEditable
                      ? 'Рабочий staff-модуль: список команд, создание новых записей и обновление основных полей без ручной перезагрузки.'
                      : 'Обзор команд в ограниченном staff-контуре. Глобальное управление командами в этой секции доступно только MANAGER и ADMIN.'
                  }
                >
                  <TeamsSectionContent
                    totalTeamsCount={overview.teams.length}
                    teamCityFilter={teamCityFilter}
                    setTeamCityFilter={setTeamCityFilter}
                    teamFilterCityOptions={teamFilterCityOptions}
                    teamCityOptions={trainingCityOptions}
                    isTeamEditable={isTeamEditable}
                    isTeamCreateMode={isTeamCreateMode}
                    handleTeamCreateStart={handleTeamCreateStart}
                    handleTeamCreateCancel={handleTeamCreateCancel}
                    filteredTeams={filteredTeams}
                    activeTeamId={activeTeamId}
                    handleTeamSelect={handleTeamSelect}
                    teamFeedback={teamFeedback}
                    activeTeamEditor={activeTeamEditor}
                    selectedTeam={selectedTeam}
                    selectedTeamMembersCount={selectedTeamMembersCount}
                    savingTeamKey={savingTeamKey}
                    setTeamEditorId={setTeamEditorId}
                    setTeamEditor={setTeamEditor}
                    setTeamFeedback={setTeamFeedback}
                    handleTeamSave={handleTeamSave}
                    isTeamCreateReady={isTeamCreateReady}
                    isTeamDirty={isTeamDirty}
                  />
                </SectionCard>
              ) : null}

              {visibleAdminSectionIds.has('teams') ? (
                <SectionCard
                  title="Состав"
                  description={
                    isTeamEditable
                      ? 'Рабочий staff-модуль: фильтр по команде, добавление участника в состав и обновление статуса, позиции, номера и даты вступления.'
                      : 'Обзор состава команд в ограниченном staff-контуре. Глобальное управление составом доступно только MANAGER и ADMIN.'
                  }
                >
                  <TeamMembersSectionContent
                    totalTeamMembersCount={overview.teamMembers.length}
                    teamMemberTeamFilter={teamMemberTeamFilter}
                    setTeamMemberTeamFilter={setTeamMemberTeamFilter}
                    teamMemberTeamOptions={teamMemberTeamOptions}
                    filteredTeamMembers={filteredTeamMembers}
                    activeTeamMemberId={activeTeamMemberId}
                    handleTeamMemberSelect={handleTeamMemberSelect}
                    isTeamEditable={isTeamEditable}
                    isTeamMemberCreateMode={isTeamMemberCreateMode}
                    handleTeamMemberCreateStart={handleTeamMemberCreateStart}
                    handleTeamMemberCreateCancel={handleTeamMemberCreateCancel}
                    teamMemberFeedback={teamMemberFeedback}
                    activeTeamMemberEditor={activeTeamMemberEditor}
                    availableParticipantOptions={availableParticipantOptions}
                    savingTeamMemberKey={savingTeamMemberKey}
                    setTeamMemberEditorId={setTeamMemberEditorId}
                    setTeamMemberEditor={setTeamMemberEditor}
                    setTeamMemberFeedback={setTeamMemberFeedback}
                    handleTeamMemberSave={handleTeamMemberSave}
                    isTeamMemberCreateReady={isTeamMemberCreateReady}
                    selectedTeamMember={selectedTeamMember}
                    isTeamMemberDirty={isTeamMemberDirty}
                  />
                </SectionCard>
              ) : null}
              {false && visibleAdminSectionIds.has('teams') ? (
                <SectionCard
                  title="Команды"
                  description="Короткий обзор всех команд, доступных staff/admin через текущий backend."
                >
                  {(overview?.teams ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                      Команд пока нет.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(overview?.teams ?? []).slice(0, 5).map((team) => (
                        <article
                          key={team.id}
                          className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-stone-950">
                                {team.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-600">
                                {team.city?.name || 'Город не указан'}
                                {team.slug ? ` / ${team.slug}` : ''}
                              </p>
                            </div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                              {formatDate(team.updatedAt)}
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-stone-700">
                            {team.description || 'Описание не заполнено.'}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </SectionCard>
              ) : null}

              {visibleAdminSectionIds.has('teamApplications') ? (
                <SectionCard
                  title="Заявки в команду"
                  description={
                    currentUserCapabilities.teamApplicationReviewScope === 'own'
                      ? 'Только заявки по вашим coached teams. Глобальное редактирование в этом модуле доступно только MANAGER и ADMIN.'
                      : 'Рабочий staff-модуль: фильтрация, просмотр заявки и сохранение изменений без ручной перезагрузки.'
                  }
                >
                  {overview.teamApplications.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                      Заявок пока нет.
                    </p>
                  ) : (
                    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                          <label className="text-sm font-medium text-stone-700">
                            Фильтр по статусу
                            <select
                              value={teamApplicationStatusFilter}
                              onChange={(event) => {
                                setTeamApplicationStatusFilter(
                                  event.target.value as TeamApplicationStatusFilter
                                );
                                setTeamApplicationFeedback(null);
                              }}
                              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                            >
                              {teamApplicationFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-sm font-medium text-stone-700">
                            Фильтр по команде
                            <select
                              value={teamApplicationTeamFilter}
                              onChange={(event) => {
                                setTeamApplicationTeamFilter(event.target.value);
                                setTeamApplicationFeedback(null);
                              }}
                              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                            >
                              <option value="ALL">Все команды</option>
                              {teamApplicationTeamOptions.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name} / {team.cityName}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        {filteredTeamApplications.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                            По текущим фильтрам заявок нет.
                          </p>
                        ) : (
                          <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
                            {filteredTeamApplications.map((application) => {
                              const isSelected =
                                application.id === activeSelectedTeamApplicationId;

                              return (
                                <button
                                  key={application.id}
                                  type="button"
                                  onClick={() => handleTeamApplicationSelect(application)}
                                  className={`w-full rounded-2xl border p-4 text-left transition ${
                                    isSelected
                                      ? 'border-stone-950 bg-stone-950 text-white shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]'
                                      : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <p className="font-semibold">
                                        {formatPersonName(application.participant)}
                                      </p>
                                      <p
                                        className={`mt-1 text-sm ${
                                          isSelected ? 'text-stone-300' : 'text-stone-600'
                                        }`}
                                      >
                                        {application.team.name} /{' '}
                                        {application.team.city?.name || 'Город не указан'}
                                      </p>
                                      <p
                                        className={`mt-2 text-sm ${
                                          isSelected ? 'text-stone-300' : 'text-stone-700'
                                        }`}
                                      >
                                        {application.reviewedBy
                                          ? `Обработал: ${formatUserIdentity(application.reviewedBy)}`
                                          : 'Ещё не обработана'}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-start gap-2 sm:items-end">
                                      <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                          isSelected
                                            ? 'bg-white/15 text-white'
                                            : getStatusBadgeClass(application.status)
                                        }`}
                                      >
                                        {formatStatus(application.status)}
                                      </span>
                                      <p
                                        className={`text-xs ${
                                          isSelected ? 'text-stone-400' : 'text-stone-500'
                                        }`}
                                      >
                                        {formatDateTime(application.updatedAt)}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        {selectedTeamApplication && activeTeamApplicationEditor ? (
                          <div className="space-y-5">
                            {teamApplicationFeedback ? (
                              <p
                                className={`rounded-2xl border px-4 py-3 text-sm ${
                                  teamApplicationFeedback.tone === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                                }`}
                              >
                                {teamApplicationFeedback.message}
                              </p>
                            ) : null}

                            {!isTeamApplicationEditable ? (
                              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                В этом модуле редактирование доступно только для
                                MANAGER и ADMIN. Тренер видит заявки в режиме
                                просмотра.
                              </p>
                            ) : null}

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                                  Заявка #{selectedTeamApplication.id}
                                </p>
                                <h3 className="mt-2 text-xl font-semibold text-stone-950">
                                  {formatPersonName(selectedTeamApplication.participant)}
                                </h3>
                                <p className="mt-2 text-sm text-stone-600">
                                  {selectedTeamApplication.team.name} /{' '}
                                  {selectedTeamApplication.team.city?.name ||
                                    'Город не указан'}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                                  selectedTeamApplication.status
                                )}`}
                              >
                                {formatStatus(selectedTeamApplication.status)}
                              </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                                  Создана
                                </p>
                                <p className="mt-2 text-sm text-stone-800">
                                  {formatDateTime(selectedTeamApplication.createdAt)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                                  Обновлена
                                </p>
                                <p className="mt-2 text-sm text-stone-800">
                                  {formatDateTime(selectedTeamApplication.updatedAt)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                                  Кто обработал
                                </p>
                                <p className="mt-2 text-sm text-stone-800">
                                  {selectedTeamApplication.reviewedBy
                                    ? formatUserIdentity(selectedTeamApplication.reviewedBy)
                                    : 'Заявка ещё не обрабатывалась'}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-4">
                              <div className="rounded-2xl bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                                  Комментарий пользователя
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                                  {selectedTeamApplication.commentFromApplicant ||
                                    'Комментарий от заявителя не указан.'}
                                </p>
                              </div>

                              <label className="text-sm font-medium text-stone-700">
                                Статус заявки
                                {canEditSelectedTeamApplicationStatus ? (
                                  <select
                                    value={activeTeamApplicationEditor.status}
                                    onChange={(event) => {
                                      setTeamApplicationEditorId(
                                        selectedTeamApplication.id
                                      );
                                      setTeamApplicationEditor((currentEditor) =>
                                        currentEditor ?? activeTeamApplicationEditor
                                          ? {
                                              ...(currentEditor ??
                                                activeTeamApplicationEditor),
                                              status: event.target
                                                .value as StaffManagedTeamApplicationStatus,
                                            }
                                          : currentEditor
                                      );
                                      setTeamApplicationFeedback(null);
                                    }}
                                    disabled={
                                      savingTeamApplicationId ===
                                      selectedTeamApplication.id
                                    }
                                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                                  >
                                    {staffManagedTeamApplicationStatusOptions.map(
                                      (option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  <div className="mt-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800">
                                    {formatStatus(selectedTeamApplication.status)}
                                    {selectedTeamApplication.status === 'CANCELLED'
                                      ? ' — отменённые заявки в этом модуле меняются только через заметку.'
                                      : ''}
                                  </div>
                                )}
                              </label>

                              <label className="text-sm font-medium text-stone-700">
                                Internal note
                                <textarea
                                  value={activeTeamApplicationEditor.internalNote}
                                  onChange={(event) => {
                                    const nextInternalNote = event.target.value;

                                    setTeamApplicationEditorId(
                                      selectedTeamApplication.id
                                    );
                                    setTeamApplicationEditor((currentEditor) =>
                                      currentEditor ?? activeTeamApplicationEditor
                                        ? {
                                            ...(currentEditor ??
                                              activeTeamApplicationEditor),
                                            internalNote: nextInternalNote,
                                          }
                                        : currentEditor
                                    );
                                    setTeamApplicationFeedback(null);
                                  }}
                                  rows={6}
                                  disabled={
                                    !isTeamApplicationEditable ||
                                    savingTeamApplicationId ===
                                      selectedTeamApplication.id
                                  }
                                  placeholder="Внутренняя заметка staff"
                                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                                />
                              </label>
                            </div>

                            {isTeamApplicationEditable ? (
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-stone-600">
                                  {selectedTeamApplication.reviewedBy
                                    ? 'После сохранения updatedAt и reviewedBy обновятся сразу в интерфейсе.'
                                    : 'После первого сохранения заявка получит reviewedBy без ручной перезагрузки.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={handleTeamApplicationSave}
                                  disabled={
                                    !isTeamApplicationDirty ||
                                    savingTeamApplicationId ===
                                      selectedTeamApplication.id
                                  }
                                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                >
                                  {savingTeamApplicationId ===
                                  selectedTeamApplication.id
                                    ? 'Сохраняем...'
                                    : 'Сохранить заявку'}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
                            Выберите заявку слева, чтобы открыть её данные.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </SectionCard>
              ) : null}

              {visibleAdminSectionIds.has('trainings') ? (
                <SectionCard
                  title="Тренировки"
                  description={
                    currentUserCapabilities.trainingManagementScope === 'own'
                      ? 'Список ваших тренировок в ограниченном staff-контуре. Глобальное обновление в этом модуле не открыто для TRAINER.'
                      : 'Рабочий staff-модуль: список тренировок, создание и обновление основных полей без ручной перезагрузки.'
                  }
                >
                  <TrainingsSectionContent
                    overview={overview}
                    trainingActivityFilter={trainingActivityFilter}
                    setTrainingActivityFilter={setTrainingActivityFilter}
                    trainingCityFilter={trainingCityFilter}
                    setTrainingCityFilter={setTrainingCityFilter}
                    trainingFilterCityOptions={trainingFilterCityOptions}
                    isTrainingEditable={isTrainingEditable}
                    isTrainingCreateMode={isTrainingCreateMode}
                    handleTrainingCreateStart={handleTrainingCreateStart}
                    handleTrainingCreateCancel={handleTrainingCreateCancel}
                    filteredTrainings={filteredTrainings}
                    activeTrainingId={activeTrainingId}
                    handleTrainingSelect={handleTrainingSelect}
                    trainingFeedback={trainingFeedback}
                    activeTrainingEditor={activeTrainingEditor}
                    trainingCityOptions={trainingCityOptions}
                    trainingCoachOptions={trainingCoachOptions}
                    savingTrainingKey={savingTrainingKey}
                    setTrainingEditorId={setTrainingEditorId}
                    setTrainingEditor={setTrainingEditor}
                    setTrainingFeedback={setTrainingFeedback}
                    handleTrainingSave={handleTrainingSave}
                    isTrainingCreateReady={isTrainingCreateReady}
                    selectedTraining={selectedTraining}
                    isTrainingDirty={isTrainingDirty}
                  />
                </SectionCard>
              ) : null}

              {visibleAdminSectionIds.has('rentals') ? (
                <SectionCard
                  title="Аренда"
                  description="Сводка по бронированиям и инвентарю аренды в текущем staff/admin контуре."
                >
                  <RentalsSectionContent
                    overview={overview}
                    isRentalOperationalEditable={isRentalOperationalEditable}
                    pendingRentalBookingsCount={pendingRentalBookingsCount}
                    availablePublicSlotsCount={availablePublicSlotsCount}
                    rentalBookingStatusFilter={rentalBookingStatusFilter}
                    setRentalBookingStatusFilter={setRentalBookingStatusFilter}
                    filteredRentalBookings={filteredRentalBookings}
                    activeSelectedRentalBookingId={activeSelectedRentalBookingId}
                    handleRentalBookingSelect={handleRentalBookingSelect}
                    rentalBookingFeedback={rentalBookingFeedback}
                    activeRentalBookingEditor={activeRentalBookingEditor}
                    selectedRentalBooking={selectedRentalBooking}
                    setRentalBookingEditorId={setRentalBookingEditorId}
                    setRentalBookingEditor={setRentalBookingEditor}
                    setRentalBookingFeedback={setRentalBookingFeedback}
                    savingRentalBookingId={savingRentalBookingId}
                    handleRentalBookingSave={handleRentalBookingSave}
                    isRentalBookingDirty={isRentalBookingDirty}
                    rentalSlotStatusFilter={rentalSlotStatusFilter}
                    setRentalSlotStatusFilter={setRentalSlotStatusFilter}
                    filteredRentalSlots={filteredRentalSlots}
                    activeRentalSlotId={activeRentalSlotId}
                    handleRentalSlotSelect={handleRentalSlotSelect}
                    rentalSlotFeedback={rentalSlotFeedback}
                    isRentalSlotCreateMode={isRentalSlotCreateMode}
                    handleRentalSlotCreateStart={handleRentalSlotCreateStart}
                    handleRentalSlotCreateCancel={handleRentalSlotCreateCancel}
                    activeRentalSlotEditor={activeRentalSlotEditor}
                    rentalSlotResourceOptions={rentalSlotResourceOptions}
                    setRentalSlotEditorId={setRentalSlotEditorId}
                    setRentalSlotEditor={setRentalSlotEditor}
                    setRentalSlotFeedback={setRentalSlotFeedback}
                    savingRentalSlotKey={savingRentalSlotKey}
                    handleRentalSlotSave={handleRentalSlotSave}
                    isRentalSlotCreateReady={isRentalSlotCreateReady}
                    selectedRentalSlot={selectedRentalSlot}
                    selectedRentalSlotHasActiveBooking={
                      selectedRentalSlotHasActiveBooking
                    }
                    isRentalSlotDirty={isRentalSlotDirty}
                  />
                </SectionCard>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
