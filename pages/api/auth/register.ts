import type { NextApiRequest, NextApiResponse } from 'next';

import {
  assertDatabaseUrlConfigured,
  isDatabaseConfigurationError,
  sendDatabaseConfigurationError,
} from '../../../lib/api-runtime';
import {
  getCurrentUserById,
  setAuthCurrentUserCookie,
  toCurrentUserSummary,
} from '../../../lib/current-user';
import { hashPassword } from '../../../lib/password-auth';
import prisma from '../../../lib/prisma';

type RegisterBody = {
  parentFullName?: unknown;
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  telegram?: unknown;
  city?: unknown;
  childFullName?: unknown;
  birthYear?: unknown;
  age?: unknown;
  addParticipantNow?: unknown;
  interestedFormat?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  consent?: unknown;
};

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value: unknown) {
  const email = toText(value).toLowerCase();
  return email.length > 0 ? email : null;
}

function normalizePhone(value: unknown) {
  const phone = toText(value).replace(/[()\s-]/g, '');
  return phone.length > 0 ? phone : null;
}

function normalizeTelegram(value: unknown) {
  const telegram = toText(value).replace(/^@+/, '');
  return telegram.length > 0 ? telegram : null;
}

function splitFullName(fullName: string) {
  const [firstName, ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName: firstName || null,
    lastName: lastNameParts.join(' ') || null,
  };
}

function getBirthDate(body: RegisterBody) {
  const rawBirthYear = Number(toText(body.birthYear));
  const rawAge = Number(toText(body.age));
  const currentYear = new Date().getFullYear();
  const birthYear =
    Number.isInteger(rawBirthYear) && rawBirthYear >= 2000 && rawBirthYear <= currentYear
      ? rawBirthYear
      : Number.isInteger(rawAge) && rawAge > 0 && rawAge < 30
        ? currentYear - rawAge
        : null;

  return birthYear ? new Date(Date.UTC(birthYear, 0, 1)) : null;
}

function isTruthyFlag(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function validateRegisterBody(body: RegisterBody) {
  const parentFullName = toText(body.parentFullName || body.fullName);
  const phone = normalizePhone(body.phone);
  const email = normalizeEmail(body.email);
  const telegram = normalizeTelegram(body.telegram);
  const city = toText(body.city);
  const childFullName = toText(body.childFullName);
  const addParticipantNow = isTruthyFlag(body.addParticipantNow);
  const password = toText(body.password);
  const confirmPassword = toText(body.confirmPassword);
  const birthDate = getBirthDate(body);

  if (parentFullName.length < 3) {
    return { error: 'Укажите имя родителя.' };
  }

  if (!phone || phone.length < 10) {
    return { error: 'Укажите корректный телефон.' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Укажите корректную почту.' };
  }

  if (city.length < 2) {
    return { error: 'Укажите город.' };
  }

  if (addParticipantNow && childFullName.length < 3) {
    return { error: 'Укажите имя ребёнка / участника.' };
  }

  if (addParticipantNow && !birthDate) {
    return { error: 'Укажите год рождения ребёнка / участника.' };
  }

  if (password.length < 8) {
    return { error: 'Пароль должен быть не короче 8 символов.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Пароли не совпадают.' };
  }

  if (!isTruthyFlag(body.consent)) {
    return { error: 'Подтвердите согласие на обработку данных.' };
  }

  return {
    data: {
      parentFullName,
      phone,
      email,
      telegram,
      city,
      addParticipantNow,
      childFullName,
      birthDate,
      password,
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    assertDatabaseUrlConfigured();

    const validation = validateRegisterBody(req.body as RegisterBody);

    if ('error' in validation) {
      return res.status(400).json({ error: validation.error });
    }

    const { data } = validation;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone },
          ...(data.telegram ? [{ telegramId: data.telegram }] : []),
        ],
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Аккаунт с такой почтой, телефоном или Telegram уже существует.',
      });
    }

    const passwordHash = await hashPassword(data.password);
    const parentName = splitFullName(data.parentFullName);
    const childName = splitFullName(data.childFullName);

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          telegramId: data.telegram,
          passwordHash,
        },
        select: {
          id: true,
        },
      });

      if (data.addParticipantNow) {
        const city = await transaction.city.upsert({
          where: {
            name: data.city,
          },
          update: {},
          create: {
            name: data.city,
          },
        });

        const parentProfile = await transaction.userProfile.create({
          data: {
            userId: createdUser.id,
            profileType: 'PARENT',
            firstName: parentName.firstName,
            lastName: parentName.lastName,
            cityId: city.id,
          },
          select: {
            id: true,
          },
        });

        await transaction.userProfile.create({
          data: {
            userId: createdUser.id,
            profileType: 'CHILD',
            firstName: childName.firstName,
            lastName: childName.lastName,
            birthDate: data.birthDate,
            parentId: parentProfile.id,
            cityId: city.id,
          },
        });
      }

      return createdUser;
    });

    const currentUser = await getCurrentUserById(prisma, user.id);

    if (!currentUser) {
      return res.status(500).json({ error: 'Не удалось открыть созданный аккаунт.' });
    }

    setAuthCurrentUserCookie(res, currentUser.id);

    return res.status(201).json({
      ok: true,
      currentUser: toCurrentUserSummary(currentUser),
      accountStatus: 'AWAITING_APPROVAL',
    });
  } catch (error) {
    if (isDatabaseConfigurationError(error)) {
      return sendDatabaseConfigurationError(res, 'Register account failed', error);
    }

    console.error('Register account failed:', error);
    return res.status(500).json({ error: 'Не удалось создать аккаунт.' });
  }
}
