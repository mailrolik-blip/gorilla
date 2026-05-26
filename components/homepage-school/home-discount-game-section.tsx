'use client';

import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import { useGorillaAccount } from '@/components/gorilla-account-provider';
import { MiniHockeyDiscountGame } from '@/components/games/mini-hockey-discount-game';

import { HomeSectionHeading } from './home-section-heading';

type HomeDiscountGameSectionProps = {
  section: HomepageSchoolContent['discountGame'];
  site: HomepageSchoolContent['site'];
};

export function HomeDiscountGameSection({
  section,
  site,
}: HomeDiscountGameSectionProps) {
  const {
    authStatus,
    isAuthenticated,
    pointsBalance,
    guestPreviewPoints,
    nextReward,
    unlockedRewards,
  } = useGorillaAccount();

  const displayBalance = isAuthenticated ? pointsBalance : guestPreviewPoints;

  return (
    <section id="discount-game" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] overflow-hidden p-5 sm:p-6">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          action={
            <div className="flex flex-wrap gap-3">
              <a
                href="#gorilla-mini-game"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                Играть
              </a>
              {isAuthenticated ? (
                <Link
                  href={site.cabinetHref}
                  className="home-ice-chip inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
                >
                  Открыть кабинет
                </Link>
              ) : (
                <Link
                  href={site.loginHref}
                  className="home-ice-chip inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
                >
                  Войти и копить баллы
                </Link>
              )}
            </div>
          }
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="home-ice-panel-soft rounded-[1.9rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--gh-accent)]">
                Текущий баланс
              </p>
              <p className="mt-3 text-[2.4rem] font-black tracking-[-0.06em] text-[color:var(--gh-text)]">
                {displayBalance} GP
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                {isAuthenticated
                  ? nextReward
                    ? `До следующей награды осталось ${nextReward.cost - pointsBalance} GP.`
                    : 'Все базовые награды уже открыты. Следующий шаг — обмен через кабинет или Telegram школы.'
                  : authStatus === 'loading'
                    ? 'Проверяем вход, чтобы подключить сохранение баллов.'
                    : 'Играть можно и гостем, но для сохранения баллов и обмена на награды нужен вход в кабинет.'}
              </p>
            </div>

            {unlockedRewards.length > 0 ? (
              <div className="home-ice-panel-soft rounded-[1.9rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--gh-accent)]">
                  Уже доступно
                </p>
                <div className="mt-4 space-y-3">
                  {unlockedRewards.slice(-2).map((reward) => (
                    <div
                      key={reward.id}
                      className="rounded-[1.3rem] border border-amber-300/18 bg-amber-400/10 px-4 py-4"
                    >
                      <p className="text-sm font-black text-[color:var(--gh-text)]">
                        {reward.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--gh-muted)]">
                        {reward.perk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {section.rewards.map((reward) => (
                <span
                  key={reward}
                  className="home-ice-chip rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--gh-muted)]"
                >
                  {reward}
                </span>
              ))}
            </div>

            <details className="home-ice-panel-soft group rounded-[1.8rem] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text)]">
                Правила и награды
                <span className="text-[color:var(--gh-muted)] transition group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                {section.rules.map((rule) => (
                  <li key={rule} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="min-w-0">
            <MiniHockeyDiscountGame />
          </div>
        </div>
      </div>
    </section>
  );
}
