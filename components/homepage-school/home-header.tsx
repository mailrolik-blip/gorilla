'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import type { HomepageMenuItem, HomepageSchoolContent } from '@/content/homepage-school';
import { useGorillaAccount } from '@/components/gorilla-account-provider';

import { HomeAuthSheet } from './home-auth-sheet';

type HomeHeaderProps = {
  menuItems: HomepageMenuItem[];
  site: HomepageSchoolContent['site'];
};

const menuGroups = [
  {
    label: 'О клубе',
    items: [
      { label: 'О школе', href: '#hero', mobileLabel: 'Главная' },
      { label: 'Новости', href: '#news', mobileLabel: 'Новости' },
      { label: 'Контакты', href: '#location', mobileLabel: 'Контакты' },
    ],
  },
  {
    label: 'Тренировки',
    items: [
      { label: 'Форматы льда', href: '#trainings', mobileLabel: 'Лёд' },
      { label: 'Выбрать дату', href: '/cabinet' },
      { label: 'Аренда льда', href: '#rent' },
    ],
  },
  {
    label: 'Команда',
    items: [
      { label: 'Команды в городах', href: '#teams', mobileLabel: 'Команды' },
      { label: 'Тренерский штаб', href: '#trainers' },
      { label: 'Матчи и записи', href: '#live', mobileLabel: 'Live' },
    ],
  },
  {
    label: 'Активности',
    items: [
      { label: 'Мини-игра', href: '#discount-game', mobileLabel: 'Игра' },
      { label: 'Gorilla Points', href: '#discount-game' },
      { label: 'Акции клуба', href: '#news' },
    ],
  },
] satisfies Array<{ label: string; items: HomepageMenuItem[] }>;

function BurgerIcon({ compact, open }: { compact: boolean; open: boolean }) {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.86)] shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-[color:var(--gh-text)] transition ${open ? 'translate-y-0 rotate-45' : compact ? '-translate-y-1.5' : '-translate-y-1'}`}
      />
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-[color:var(--gh-text)] transition ${open ? 'opacity-0' : 'opacity-100'}`}
      />
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-[color:var(--gh-text)] transition ${open ? 'translate-y-0 -rotate-45' : compact ? 'translate-y-1.5' : 'translate-y-1'}`}
      />
    </span>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.125rem] w-[1.125rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 17.5h-7A2.5 2.5 0 0 1 6 15V11a6 6 0 0 1 12 0v4a2.5 2.5 0 0 1-2.5 2.5Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
      <path d="M12 3.5V5" />
    </svg>
  );
}

function LightModePlaceholderButton({
  compact,
  mobile,
}: {
  compact: boolean;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label="Светлый режим скоро"
      title="Светлый режим скоро"
      className={`${mobile ? 'flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] px-2 text-center text-[11px]' : compact ? 'h-11 w-11 rounded-full text-[11px]' : 'h-12 rounded-full px-4 text-xs'} border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.62)] font-bold uppercase tracking-[0.14em] text-[color:var(--gh-muted)] opacity-80`}
    >
      {mobile ? (
        <>
          <span className="mb-1 h-1.5 w-1.5 rounded-full bg-white/52" />
          Свет
        </>
      ) : compact ? (
        'С'
      ) : (
        'Светлая'
      )}
    </button>
  );
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const notificationKindLabels = {
  system: 'система',
  points: 'баллы',
  reward: 'награда',
  news: 'новости',
  booking: 'запись',
};

function NotificationDropdown({
  compact,
  mobile,
  onNavigate,
}: {
  compact: boolean;
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const {
    notifications,
    unreadCount,
    pointsBalance,
    markAllNotificationsRead,
    markNotificationRead,
  } = useGorillaAccount();

  return (
    <div
      className={`${mobile ? 'absolute bottom-full right-0 mb-3 w-[min(94vw,23rem)]' : 'absolute right-0 top-full mt-3 w-[22rem]'} home-ice-panel overflow-hidden rounded-[1.75rem]`}
    >
      <div className="border-b border-[color:var(--gh-border)] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
              Уведомления
            </p>
            <p className="mt-2 text-sm text-[color:var(--gh-muted)]">
              Gorilla Points: <span className="font-black text-[color:var(--gh-text)]">{pointsBalance} GP</span>
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className={`rounded-full border border-[color:var(--gh-border)] bg-white/5 ${compact ? 'px-3 py-2 text-[10px]' : 'px-3 py-2 text-[11px]'} font-bold uppercase tracking-[0.16em] text-[color:var(--gh-text)] transition hover:bg-white/10`}
            >
              Прочитать всё
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[22rem] space-y-2 overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4 text-sm text-[color:var(--gh-muted)]">
            Пока тихо. Новые начисления, новости и статусы записей появятся здесь.
          </div>
        ) : (
          notifications.map((notification) => (
            <a
              key={notification.id}
              href={notification.href ?? '/cabinet'}
              onClick={() => {
                markNotificationRead(notification.id);
                onNavigate();
              }}
              className={`block rounded-[1.2rem] border px-4 py-4 transition ${
                notification.unread
                  ? 'border-amber-300/18 bg-amber-400/8'
                  : 'border-white/8 bg-white/[0.03]'
              } hover:border-white/12 hover:bg-white/[0.06]`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[color:var(--gh-text)]">{notification.title}</p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    notification.tone === 'accent'
                      ? 'bg-amber-400/15 text-amber-200'
                      : notification.tone === 'success'
                        ? 'bg-emerald-400/12 text-emerald-200'
                        : 'bg-white/8 text-white/60'
                  }`}
                >
                  {notificationKindLabels[notification.kind]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--gh-muted)]">
                {notification.description}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                {formatNotificationTime(notification.createdAt)}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function NotificationBellButton({
  compact,
  mobile,
}: {
  compact: boolean;
  mobile?: boolean;
}) {
  const { unreadCount } = useGorillaAccount();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${mobile ? 'justify-self-end' : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Открыть уведомления"
        className={`${mobile ? 'h-[3.75rem] min-h-[3.75rem] w-full rounded-[1.05rem]' : compact ? 'h-11 w-11 rounded-full' : 'h-12 w-12 rounded-full'} relative inline-flex items-center justify-center border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.82)] text-[color:var(--gh-text)] transition hover:bg-[rgba(27,43,59,0.94)]`}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 min-w-[1.15rem] rounded-full bg-[color:var(--gh-accent)] px-1.5 py-0.5 text-[10px] font-black text-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationDropdown
          compact={compact}
          mobile={mobile}
          onNavigate={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}

export function HomeHeader({ menuItems, site }: HomeHeaderProps) {
  const { authStatus, isAuthenticated } = useGorillaAccount();
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authSheetMode, setAuthSheetMode] = useState<'login' | 'register' | null>(null);

  const handleScroll = useEffectEvent(() => {
    const nextCompact = window.scrollY > 88;
    setIsCompact(nextCompact);
    if (!nextCompact) {
      setIsMenuOpen(false);
    }
  });

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mobileItems = menuItems.filter((item) => item.mobileLabel).slice(0, 2);
  const showAuthenticatedActions = authStatus === 'authenticated' && isAuthenticated;

  return (
    <>
      <header data-homepage-shell-nav="true" className="fixed inset-x-0 top-0 z-50 hidden md:block">
        <div className="mx-auto max-w-[1480px] px-4 pt-3 sm:px-6 lg:px-8">
          <div
            className={`transition-all duration-300 ${isCompact ? 'rounded-none border border-transparent bg-transparent px-0 py-0 shadow-none backdrop-blur-0' : 'rounded-[1.9rem] border border-[color:var(--gh-border)] bg-[rgba(8,16,26,0.68)] px-4 py-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] backdrop-blur-xl xl:px-5'}`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <a
                href="#hero"
                className={`flex min-w-0 shrink-0 items-center gap-2 rounded-full transition hover:opacity-90 xl:gap-3 ${isCompact ? 'border border-white/8 bg-black/30 px-2 py-1.5 backdrop-blur-xl' : 'px-1 py-1'}`}
              >
                <Image
                  src={site.logoSrc}
                  alt={site.logoAlt}
                  width={54}
                  height={54}
                  className={`${isCompact ? 'h-11 w-11' : 'h-12 w-12'} object-contain`}
                  priority
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase tracking-[0.16em] text-[color:var(--gh-text)]">
                    {site.brand}
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-[0.22em] text-[color:var(--gh-muted)]">
                    хоккейный клуб
                  </p>
                </div>
              </a>

              {!isCompact ? (
                <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                  {menuGroups.map((group) => (
                    <div key={group.label} className="group relative py-2">
                      <button
                        type="button"
                        className="whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.84)] hover:text-[color:var(--gh-text)] xl:text-sm"
                      >
                        {group.label}
                      </button>
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 w-56 -translate-x-1/2 pt-2 opacity-0 transition delay-100 duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:delay-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                        <div className="rounded-[1.4rem] border border-[color:var(--gh-border)] bg-[rgba(10,18,28,0.94)] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
                        {group.items.map((item) => (
                          <a
                            key={`${group.label}-${item.href}-${item.label}`}
                            href={item.href}
                            className="block rounded-[1rem] px-4 py-3 text-sm font-semibold text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.92)] hover:text-[color:var(--gh-text)]"
                          >
                            {item.label}
                          </a>
                        ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </nav>
              ) : (
                <div className="hidden flex-1 lg:block" />
              )}

              <div className={`ml-auto flex items-center gap-2 ${isCompact ? 'rounded-full border border-white/8 bg-black/30 p-1.5 backdrop-blur-xl' : ''}`}>
                <LightModePlaceholderButton compact={isCompact} />

                {showAuthenticatedActions ? (
                  <>
                    <NotificationBellButton compact={isCompact} />
                    <Link
                      href={site.cabinetHref}
                      className={`${isCompact ? 'px-4 py-2.5 text-xs' : 'px-5 py-3 text-sm'} rounded-full bg-[color:var(--gh-accent)] font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110`}
                    >
                      Личный кабинет
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthSheetMode('login')}
                      className={`${isCompact ? 'px-4 py-2.5 text-xs' : 'px-5 py-3 text-sm'} rounded-full border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.82)] font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text)] transition hover:bg-[rgba(27,43,59,0.94)]`}
                    >
                      Вход
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthSheetMode('register')}
                      className={`${isCompact ? 'hidden 2xl:inline-flex px-4 py-2.5 text-xs' : 'hidden px-4 py-3 text-sm xl:inline-flex 2xl:px-5'} rounded-full bg-[color:var(--gh-accent)] font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110`}
                    >
                      Регистрация
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  aria-expanded={isMenuOpen}
                  aria-label="Открыть меню"
                  className={`${isCompact ? '' : 'lg:hidden'} rounded-full`}
                >
                  <BurgerIcon compact={isCompact} open={isMenuOpen} />
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen ? (
            <div className="mt-2 rounded-[1.8rem] border border-[color:var(--gh-border)] bg-[rgba(10,18,28,0.88)] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {menuGroups.map((group) => (
                  <div key={group.label} className="rounded-[1.2rem] bg-[rgba(18,31,45,0.8)] p-3">
                    <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
                      {group.label}
                    </p>
                    <div className="mt-2 space-y-1">
                      {group.items.map((item) => (
                        <a
                          key={`${group.label}-${item.href}-${item.label}`}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block rounded-[0.9rem] px-3 py-2 text-sm font-semibold text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.92)] hover:text-[color:var(--gh-text)]"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <nav
        data-homepage-shell-nav="true"
        className="fixed inset-x-4 bottom-3 z-50 md:hidden"
      >
        <div className="grid grid-cols-6 gap-2 rounded-[1.55rem] border border-[color:var(--gh-border)] bg-[rgba(8,16,26,0.9)] p-2 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          {mobileItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] px-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.84)] hover:text-[color:var(--gh-text)]"
            >
              <span className="mb-1 h-1.5 w-1.5 rounded-full bg-[color:var(--gh-accent)]" />
              {item.mobileLabel ?? item.label}
            </a>
          ))}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] px-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.84)] hover:text-[color:var(--gh-text)]"
            aria-expanded={isMobileMenuOpen}
            aria-label="Открыть меню"
          >
            <span className="mb-1 h-1.5 w-1.5 rounded-full bg-[color:var(--gh-accent)]" />
            Меню
          </button>

          <LightModePlaceholderButton compact={false} mobile />

          {showAuthenticatedActions ? (
            <>
              <NotificationBellButton compact={false} mobile />
              <Link
                href={site.cabinetHref}
                className="flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] bg-[color:var(--gh-accent)] px-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
              >
                <span className="mb-1 h-1.5 w-1.5 rounded-full bg-black" />
                Кабинет
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAuthSheetMode('login')}
                className="flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.82)] px-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--gh-text)] transition hover:bg-[rgba(27,43,59,0.94)]"
              >
                <span className="mb-1 h-1.5 w-1.5 rounded-full bg-[color:var(--gh-accent)]" />
                Вход
              </button>
              <button
                type="button"
                onClick={() => setAuthSheetMode('register')}
                className="flex min-h-[3.75rem] flex-col items-center justify-center rounded-[1.05rem] bg-[color:var(--gh-accent)] px-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
              >
                <span className="mb-1 h-1.5 w-1.5 rounded-full bg-black" />
                Рег.
              </button>
            </>
          )}
        </div>

        {isMobileMenuOpen ? (
          <div className="absolute bottom-full left-0 right-0 mb-3 max-h-[70vh] overflow-y-auto rounded-[1.55rem] border border-[color:var(--gh-border)] bg-[rgba(8,16,26,0.94)] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="grid gap-3">
              {menuGroups.map((group) => (
                <div key={group.label} className="rounded-[1.2rem] bg-[rgba(18,31,45,0.76)] p-3">
                  <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
                    {group.label}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {group.items.map((item) => (
                      <a
                        key={`${group.label}-${item.href}-${item.label}`}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-[0.9rem] px-3 py-2 text-sm font-semibold text-[color:var(--gh-muted)] transition hover:bg-[rgba(27,43,59,0.92)] hover:text-[color:var(--gh-text)]"
                      >
                        {item.mobileLabel ?? item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      {authSheetMode ? (
        <HomeAuthSheet
          mode={authSheetMode}
          site={site}
          onClose={() => setAuthSheetMode(null)}
        />
      ) : null}
    </>
  );
}
