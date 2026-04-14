'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CitySummary = {
  id: number;
  name: string;
};

type CurrentUserSummary = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  staffRole: string | null;
  roles: string[];
  preferredCity: CitySummary | null;
  profile: {
    id: number;
    profileType: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

type ParticipantSummary = {
  id: number;
  profileType: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  city: CitySummary | null;
};

type TrainingBookingSummary = {
  id: number;
  status: string;
  participant: ParticipantSummary | null;
  training: {
    trainingId: number;
    name: string;
    trainingType: string;
    startTime: string;
    endTime: string;
    location: string;
    city: CitySummary;
  };
};

type TeamApplicationSummary = {
  id: number;
  status: string;
  commentFromApplicant: string | null;
  participant: ParticipantSummary | null;
  team: {
    id: number;
    name: string;
    city: CitySummary | null;
  };
};

type RentalBookingSummary = {
  id: number;
  status: string;
  participant: ParticipantSummary | null;
  slot: {
    id: number;
    startsAt: string;
    endsAt: string;
    status: string;
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

type DashboardPayload = {
  currentUser: CurrentUserSummary;
  participants: ParticipantSummary[];
  trainingBookings: TrainingBookingSummary[];
  teamApplications: TeamApplicationSummary[];
  rentalBookings: RentalBookingSummary[];
};

const roleLabels: Record<string, string> = {
  USER: 'Пользователь',
  COACH: 'Тренер',
  MANAGER: 'Менеджер',
  ADMIN: 'Администратор',
};

const profileTypeLabels: Record<string, string> = {
  PLAYER: 'Игрок',
  CHILD: 'Ребенок',
  PARENT: 'Родитель',
  ADULT: 'Взрослый',
};

const statusLabels: Record<string, string> = {
  booked: 'Запись оформлена',
  cancelled: 'Отменено',
  PENDING: 'На рассмотрении',
  IN_REVIEW: 'В работе',
  ACCEPTED: 'Одобрено',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
  PENDING_CONFIRMATION: 'Ждет подтверждения',
  CONFIRMED: 'Подтверждено',
};

function translateErrorMessage(message: string) {
  const errorMessages: Record<string, string> = {
    'Failed to load dashboard': 'Не удалось загрузить кабинет.',
    'Current user is not authenticated': 'Пользователь не авторизован.',
  };

  return errorMessages[message] ?? message;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRoleList(roles: string[]) {
  if (roles.length === 0) {
    return 'Не указаны';
  }

  return roles.map((role) => roleLabels[role] ?? role).join(', ');
}

function formatProfileType(profileType: string | null) {
  if (!profileType) {
    return 'Профиль';
  }

  return profileTypeLabels[profileType] ?? profileType;
}

function formatPersonName(participant: ParticipantSummary | null) {
  if (!participant) {
    return 'Участник не указан';
  }

  const fullName = [participant.firstName, participant.lastName]
    .filter(Boolean)
    .join(' ');

  return fullName || formatProfileType(participant.profileType);
}

function formatStatus(status: string) {
  return statusLabels[status] ?? status;
}

function SectionCard(props: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
        {props.eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-stone-950">{props.title}</h2>
      <div className="mt-5">{props.children}</div>
    </section>
  );
}

export default function CabinetPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch('/api/me/dashboard', {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.replace('/dev/login?next=/cabinet');
          return;
        }

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(payload?.error || 'Failed to load dashboard')
          );
        }

        if (!isCancelled) {
          setDashboard(payload as DashboardPayload);
          setStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить кабинет.'
          );
          setStatus('error');
        }
      }
    }

    void loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#ede6d8_45%,#e4ddcf_100%)] px-4 py-8 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[30px] border border-stone-300/70 bg-[#171411] px-6 py-7 text-stone-100 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                Личный кабинет
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Ваш кабинет
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                Единая точка входа для ваших участников, записей на тренировки,
                заявок в команду и бронирований.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dev/login?next=/cabinet"
                className="rounded-full border border-stone-600 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-300 hover:text-white"
              >
                Вход в режиме разработки
              </Link>
            </div>
          </div>
        </header>

        {status === 'loading' ? (
          <section className="rounded-[28px] border border-stone-300/70 bg-white/90 p-6 text-sm text-stone-600 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            Загружаем кабинет...
          </section>
        ) : null}

        {status === 'error' ? (
          <section className="rounded-[28px] border border-rose-300 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            {error}
          </section>
        ) : null}

        {status === 'ready' && dashboard ? (
          <>
            <SectionCard
              eyebrow="Текущий пользователь"
              title={`Пользователь #${dashboard.currentUser.id}`}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-sm font-medium text-stone-500">Профиль</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {dashboard.currentUser.profile
                      ? formatPersonName(dashboard.currentUser.profile as ParticipantSummary)
                      : 'Профиль не заполнен'}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Роли: {formatRoleList(dashboard.currentUser.roles)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-sm font-medium text-stone-500">Контакты</p>
                  <p className="mt-2 text-sm text-stone-700">
                    Эл. почта: {dashboard.currentUser.email || 'Не указана'}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Телеграм: {dashboard.currentUser.telegramId || 'Не указан'}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Предпочитаемый город:{' '}
                    {dashboard.currentUser.preferredCity?.name || 'Не указан'}
                  </p>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard eyebrow="Участники" title="Мои участники">
                {dashboard.participants.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет участников.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.participants.map((participant) => (
                      <article
                        key={participant.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {formatPersonName(participant)}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatProfileType(participant.profileType)}
                            </p>
                          </div>
                          <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                            #{participant.id}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard eyebrow="Тренировки" title="Мои записи на тренировки">
                {dashboard.trainingBookings.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет ближайших записей на тренировки.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.trainingBookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {booking.training.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatPersonName(booking.participant)} /{' '}
                              {booking.training.location}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {formatDateTime(booking.training.startTime)}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard eyebrow="Команда" title="Мои заявки в команду">
                {dashboard.teamApplications.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет активных заявок в команду.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.teamApplications.map((application) => (
                      <article
                        key={application.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {application.team.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatPersonName(application.participant)}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {application.commentFromApplicant || 'Комментарий не указан.'}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            {formatStatus(application.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard eyebrow="Аренда" title="Мои бронирования">
                {dashboard.rentalBookings.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет активных бронирований.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.rentalBookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {booking.resource.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {booking.facility.name} / {booking.city.name}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {formatDateTime(booking.slot.startsAt)}
                            </p>
                          </div>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
