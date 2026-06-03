'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { homepageSchoolContent } from '@/content/homepage-school';
import { WorkspaceDisclosure, WorkspaceScoreStrip } from '@/components/workspace-frame';
import {
  PROMO_COMPLIANCE_NOTICE,
  evaluateTicketSymbols,
  formatPromoCombination,
  formatPromoTicketStatus,
  getPromoPrizeFallback,
  promoSymbolMeta,
  type PromoSymbol,
  type PromoTicketUserView,
} from '@/lib/promo';

type PromoWorkspaceVariant = 'full' | 'cabinet';
type FetchState = 'loading' | 'ready' | 'error';

type FetchResult<T> = {
  payload: T | { error?: string } | null;
  response: Response;
};

const statusToneMap: Record<
  PromoTicketUserView['status'],
  { chip: string; panel: string }
> = {
  NEW: {
    chip: 'border-sky-400/30 bg-sky-500/12 text-sky-100',
    panel: 'border-sky-400/30 bg-sky-500/12 text-sky-100',
  },
  OPENED: {
    chip: 'border-violet-400/30 bg-violet-500/12 text-violet-100',
    panel: 'border-violet-400/30 bg-violet-500/12 text-violet-100',
  },
  WIN: {
    chip: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100',
    panel: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100',
  },
  LOSE: {
    chip: 'border-white/10 bg-black/20 text-stone-200',
    panel: 'border-white/10 bg-black/20 text-stone-200',
  },
  EXPIRED: {
    chip: 'border-rose-400/30 bg-rose-500/12 text-rose-100',
    panel: 'border-rose-400/30 bg-rose-500/12 text-rose-100',
  },
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<FetchResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  let payload: T | { error?: string } | null = null;

  try {
    payload = (await response.json()) as T | { error?: string };
  } catch {
    payload = null;
  }

  return { response, payload };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Не открывался';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function buildPrizeDisplay(ticket: PromoTicketUserView) {
  if (!ticket.symbols) {
    return null;
  }

  const evaluation = evaluateTicketSymbols(ticket.symbols);

  if (evaluation.status !== 'WIN') {
    return null;
  }

  const fallback = getPromoPrizeFallback(evaluation.prizeSymbol);

  return {
    symbol: evaluation.prizeSymbol,
    title: ticket.prize?.title ?? fallback.title,
    description: ticket.prize?.description ?? fallback.description,
  };
}

function SymbolCard({
  symbol,
  hidden,
  loading,
}: {
  symbol: PromoSymbol | undefined;
  hidden: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center rounded-[1.5rem] border border-amber-300/30 bg-amber-400/10 p-4 text-center">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-amber-200/40" />
        <div className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
          Открываем
        </div>
      </div>
    );
  }

  if (hidden || !symbol) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 text-center">
        <div className="text-4xl">🎫</div>
        <div className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
          Запечатано
        </div>
      </div>
    );
  }

  const meta = promoSymbolMeta[symbol];

  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-[1.5rem] border border-white/8 bg-black/18 p-4 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white/[0.06] text-3xl">
        {meta.emoji}
      </div>
      <div className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
        {meta.shortLabel}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{meta.label}</div>
    </div>
  );
}

function PromoTicketResult({
  ticket,
  openingTicketId,
  onOpen,
  openError,
}: {
  ticket: PromoTicketUserView;
  openingTicketId: number | null;
  onOpen: (ticketId: number) => Promise<void>;
  openError: string | null;
}) {
  const isOpening = openingTicketId === ticket.id;
  const prizeDisplay = buildPrizeDisplay(ticket);
  const evaluation = ticket.symbols ? evaluateTicketSymbols(ticket.symbols) : null;

  return (
    <div className="rounded-[1.9rem] bg-white/[0.03] p-5 backdrop-blur ring-1 ring-inset ring-white/8">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
            Карточка билета
          </div>
          <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {ticket.code}
          </h3>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            {ticket.status === 'NEW'
              ? 'Билет можно открыть один раз. После открытия результат фиксируется на сервере и больше не пересчитывается.'
              : 'Билет уже открыт или завершен. Сервер возвращает тот же результат при повторном запросе и не пересчитывает его.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusToneMap[ticket.status].chip}`}
          >
            {formatPromoTicketStatus(ticket.status)}
          </span>
          <span className="inline-flex rounded-full border border-white/8 bg-white/[0.05] px-3 py-1 text-xs font-bold text-stone-300">
            {ticket.status === 'NEW' ? 'Запечатан' : 'Открыт'}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <SymbolCard
            key={index}
            symbol={ticket.symbols?.[index]}
            hidden={ticket.status === 'NEW'}
            loading={isOpening}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[1.5rem] border border-white/8 bg-black/18 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
            Результат
          </div>

          {ticket.status === 'NEW' ? (
            <>
              <div className="mt-3 text-lg font-black text-white">
                Билет ещё не открыт
              </div>
              <p className="mt-2 text-sm leading-7 text-stone-400">
                После открытия вы увидите три символа и зафиксированный результат.
              </p>
            </>
          ) : ticket.status === 'EXPIRED' ? (
            <>
              <div className="mt-3 text-lg font-black text-rose-300">
                Билет истек
              </div>
              <p className="mt-2 text-sm leading-7 text-stone-400">
                Срок действия билета закончился до открытия или был завершен staff.
              </p>
            </>
          ) : prizeDisplay ? (
            <>
              <div className="mt-3 text-lg font-black text-emerald-300">
                Выигрыш: {prizeDisplay.title}
              </div>
              <p className="mt-2 text-sm leading-7 text-stone-400">
                {prizeDisplay.description}
              </p>
              <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
                Комбинация: {formatPromoCombination(ticket.symbols!)}
              </div>
            </>
          ) : (
            <>
              <div className="mt-3 text-lg font-black text-white">Без приза</div>
              <p className="mt-2 text-sm leading-7 text-stone-400">
                {evaluation?.reason === 'triple-no-win'
                  ? 'NO_WIN + NO_WIN + NO_WIN фиксируется как результат без приза.'
                  : 'Несовпадающие символы также фиксируются как результат без приза.'}
              </p>
              {ticket.symbols ? (
                <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
                  Комбинация: {formatPromoCombination(ticket.symbols)}
                </div>
              ) : null}
            </>
          )}

          {openError ? (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-100">
              {openError}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpen(ticket.id)}
              disabled={ticket.status !== 'NEW' || openingTicketId !== null}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500"
            >
              {isOpening ? 'Открываем билет...' : 'Открыть билет'}
            </button>

            <div className="inline-flex items-center rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-stone-300">
              Только одно открытие
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-black/18 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
            Метаданные
          </div>
          <div className="mt-4 space-y-3 text-sm text-stone-300">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                Кампания
              </div>
              <div className="mt-1 font-semibold text-white">
                {ticket.campaignLabel || 'Промо-кампания Gorilla'}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                Создан
              </div>
              <div className="mt-1 font-semibold text-white">
                {formatDateTime(ticket.createdAt)}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                Истекает
              </div>
              <div className="mt-1 font-semibold text-white">
                {formatDateTime(ticket.expiresAt)}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                Открыт
              </div>
              <div className="mt-1 font-semibold text-white">
                {formatDateTime(ticket.openedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromoTicketWorkspace({
  variant = 'full',
}: {
  variant?: PromoWorkspaceVariant;
}) {
  const [status, setStatus] = useState<FetchState>('loading');
  const [tickets, setTickets] = useState<PromoTicketUserView[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [openingTicketId, setOpeningTicketId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadTickets() {
      setStatus('loading');
      setError(null);

      const result = await fetchJson<PromoTicketUserView[]>('/api/my/promo-tickets');

      if (result.response.status === 401) {
        if (!isCancelled) {
          setStatus('error');
          setError(
            'Промо-билеты доступны после входа в личный кабинет. Для подключения доступа напишите Gorilla Hockey в Telegram.'
          );
        }
        return;
      }

      if (!result.response.ok) {
        if (!isCancelled) {
          setStatus('error');
          setError(
            (result.payload as { error?: string } | null)?.error ||
              'Не удалось загрузить промо-билеты.'
          );
        }
        return;
      }

      const nextTickets = result.payload as PromoTicketUserView[];

      if (!isCancelled) {
        setTickets(nextTickets);
        setSelectedTicketId((currentSelectedTicketId) => {
          if (
            currentSelectedTicketId &&
            nextTickets.some((ticket) => ticket.id === currentSelectedTicketId)
          ) {
            return currentSelectedTicketId;
          }

          return nextTickets[0]?.id ?? null;
        });
        setStatus('ready');
      }
    }

    void loadTickets();

    return () => {
      isCancelled = true;
    };
  }, [variant]);

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0] ?? null;
  const newCount = tickets.filter((ticket) => ticket.status === 'NEW').length;
  const winCount = tickets.filter((ticket) => ticket.status === 'WIN').length;
  const loseCount = tickets.filter((ticket) => ticket.status === 'LOSE').length;
  const expiredCount = tickets.filter((ticket) => ticket.status === 'EXPIRED').length;

  async function handleOpen(ticketId: number) {
    setOpenError(null);
    setOpeningTicketId(ticketId);

    const result = await fetchJson<PromoTicketUserView>(`/api/promo-tickets/${ticketId}/open`, {
      method: 'POST',
    });

    if (result.response.status === 401) {
      setOpenError(
        'Сессия не активна. Для подключения доступа напишите Gorilla Hockey в Telegram.'
      );
      setOpeningTicketId(null);
      return;
    }

    if (!result.response.ok) {
      setOpenError(
        (result.payload as { error?: string } | null)?.error ||
          'Не удалось открыть промо-билет.'
      );
      setOpeningTicketId(null);
      return;
    }

    const updatedTicket = result.payload as PromoTicketUserView;

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setSelectedTicketId(updatedTicket.id);
    setOpeningTicketId(null);
  }

  if (status === 'loading') {
    return (
      <div className="rounded-[1.75rem] bg-white/[0.035] p-6 text-sm text-stone-400 ring-1 ring-inset ring-white/8">
        Загружаем промо-билеты...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-[1.75rem] border border-rose-400/30 bg-rose-500/12 p-6 text-sm text-rose-100 shadow-sm">
        <p>{error}</p>
        <a
          href={homepageSchoolContent.site.telegramHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-2xl bg-stone-100 px-4 py-2 text-sm font-black text-black transition hover:bg-white"
        >
          Открыть Telegram
        </a>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-[1.75rem] bg-white/[0.035] p-6 ring-1 ring-inset ring-white/8">
        <div className="text-lg font-black text-white">Пока нет промо-билетов</div>
        <p className="mt-3 text-sm leading-7 text-stone-400">
          Когда билет будет выдан в рамках акции или промо-условия, он появится
          здесь автоматически.
        </p>
        <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {PROMO_COMPLIANCE_NOTICE}
        </div>
      </div>
    );
  }

  if (variant === 'cabinet') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              Gorilla Promo
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              Ваши промо-билеты
            </div>
            <p className="mt-2 text-sm leading-7 text-stone-400">
              Билеты выдаются по акции и открываются один раз.
            </p>
          </div>

          <Link
            href="/promo-tickets"
            className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-stone-800"
          >
            Полный экран промо-билетов
          </Link>
        </div>

        <WorkspaceScoreStrip
          items={[
            {
              label: 'Всего',
              value: String(tickets.length),
              detail: 'Билеты в текущей promo-кампании.',
            },
            {
              label: 'NEW',
              value: String(newCount),
              detail: 'Готовы к первому и единственному открытию.',
              accent: 'sky',
            },
            {
              label: 'WIN',
              value: String(winCount),
              detail: 'Уже открытые билеты с совпавшей комбинацией.',
              accent: 'emerald',
            },
            {
              label: 'LOSE / EXPIRED',
              value: String(loseCount + expiredCount),
              detail: 'Без приза или вне срока действия.',
            },
          ]}
          compact
        />

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  setOpenError(null);
                }}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedTicket?.id === ticket.id
                    ? 'border-amber-300/60 bg-amber-300/10'
                    : 'border-white/8 bg-white/[0.035] hover:border-white/16 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">{ticket.code}</div>
                    <div className="mt-1 text-xs text-stone-500">
                      {ticket.campaignLabel || 'Промо-кампания Gorilla'}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusToneMap[ticket.status].chip}`}
                  >
                    {formatPromoTicketStatus(ticket.status)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-stone-500">
                  Создан: {formatDateTime(ticket.createdAt)}
                </div>
              </button>
            ))}
          </div>

          {selectedTicket ? (
            <PromoTicketResult
              ticket={selectedTicket}
              openingTicketId={openingTicketId}
              onOpen={handleOpen}
              openError={openError}
            />
          ) : null}
        </div>

        <WorkspaceDisclosure label="Правила промо">
          {PROMO_COMPLIANCE_NOTICE}
        </WorkspaceDisclosure>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceScoreStrip
        items={[
          {
            label: 'Всего',
            value: String(tickets.length),
            detail: 'Билеты, доступные текущему пользователю.',
          },
          {
            label: 'NEW',
            value: String(newCount),
            detail: 'Ожидают первого открытия.',
            accent: 'sky',
          },
          {
            label: 'WIN',
            value: String(winCount),
            detail: 'Зафиксированные билеты с призом.',
            accent: 'emerald',
          },
          {
            label: 'LOSE / EXPIRED',
            value: String(loseCount + expiredCount),
            detail: 'Без приза или завершённые билеты.',
          },
        ]}
        compact
      />

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] bg-white/[0.035] p-5 backdrop-blur ring-1 ring-inset ring-white/8">
          <div className="mb-5 text-2xl font-black text-white">Мои билеты</div>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  setOpenError(null);
                }}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedTicket?.id === ticket.id
                    ? 'border-amber-300/60 bg-amber-300/10'
                    : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/6'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">{ticket.code}</div>
                    <div className="mt-1 text-xs text-stone-400">
                      {ticket.campaignLabel || 'Промо-кампания Gorilla'}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusToneMap[ticket.status].chip}`}
                  >
                    {formatPromoTicketStatus(ticket.status)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-stone-400">
                  Создан: {formatDateTime(ticket.createdAt)}
                </div>
                <div className="mt-2 text-xs text-stone-400">
                  {ticket.status === 'NEW'
                    ? `Истекает: ${formatDateTime(ticket.expiresAt)}`
                    : `Открыт: ${formatDateTime(ticket.openedAt)}`}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selectedTicket ? (
          <PromoTicketResult
            ticket={selectedTicket}
            openingTicketId={openingTicketId}
            onOpen={handleOpen}
            openError={openError}
          />
        ) : null}
      </div>

      <WorkspaceDisclosure label="Правила промо">
        {PROMO_COMPLIANCE_NOTICE}
      </WorkspaceDisclosure>
    </div>
  );
}
