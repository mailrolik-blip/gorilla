'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeAuthSheetProps = {
  mode: 'login' | 'register';
  site: HomepageSchoolContent['site'];
  onClose: () => void;
};

export function HomeAuthSheet({ mode, site, onClose }: HomeAuthSheetProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isRegister = mode === 'register';

  return (
    <div
      className="fixed inset-0 z-[96] flex items-end justify-center bg-black/72 px-4 py-5 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? 'Регистрация в Gorilla Hockey' : 'Вход в Gorilla Hockey'}
      onClick={onClose}
    >
      <section
        className="w-full max-w-xl rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.52)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--gh-accent)]">
              {isRegister ? 'Новая заявка' : 'Личный кабинет'}
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em]">
              {isRegister ? 'Регистрация через администратора' : 'Вход для подключённых аккаунтов'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
          >
            Закрыть
          </button>
        </div>

        <p className="mt-5 text-sm leading-7 text-white/72">
          {isRegister
            ? 'Онлайн-регистрация пока подключается через администратора: напишите в Telegram, укажите город, возраст игрока и интересующий формат занятий. После привязки аккаунта кабинет будет открываться напрямую.'
            : 'Если аккаунт уже привязан администратором, откройте личный кабинет. Если доступа ещё нет, напишите в Telegram, и мы подключим кабинет без dev-входа.'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {!isRegister ? (
            <Link
              href={site.cabinetHref}
              className="inline-flex justify-center rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110"
              onClick={onClose}
            >
              Открыть кабинет
            </Link>
          ) : null}
          <a
            href={site.telegramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/12"
          >
            Написать в Telegram
          </a>
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/12"
          >
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
