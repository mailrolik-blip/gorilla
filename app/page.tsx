import Link from 'next/link';

import {
  WorkspaceCanvas,
  WorkspaceDisclosure,
  WorkspaceHero,
  WorkspaceInset,
  WorkspaceScoreStrip,
} from '@/components/workspace-frame';

const scoreItems = [
  { label: 'Города', value: '2' },
  { label: 'Форматы', value: '3', accent: 'amber' as const },
  { label: 'Платформа', value: '24/7', accent: 'sky' as const },
  { label: 'Контур', value: '1' },
];

const laneItems = [
  { title: 'Школа', text: 'Техника, катание, бросок, развитие игрока.' },
  { title: 'Команда', text: 'Игровой ритм, наборы и матчевый контур.' },
  { title: 'Платформа', text: 'Кабинет, staff workspace и promo-модуль.' },
];

const quickLinks = [
  {
    title: 'Набор 25/26',
    text: 'Школьный и командный контур собираются в один маршрут.',
    href: 'https://gorillahockey.ru/tpost/2pug7he3t1-novii-nabor-2526-gg',
  },
  {
    title: 'Матчевая практика',
    text: 'Тренировка продолжается в игре, а не заканчивается занятием.',
    href: 'https://gorillahockey.ru/tpost/8joiire741-stomatent-vs-hk-gorilli',
  },
  {
    title: 'Клубный ритм',
    text: 'Новости, матчи и наборы работают как одна динамика клуба.',
    href: 'https://gorillahockey.ru/tpost/u6ijbo8i41-pobeda-hk-gorilli-vs-stomadent-schet-63',
  },
];

const promoSteps = [
  'Билет выдаётся по условиям акции.',
  'Открывается только один раз.',
  'Три одинаковых символа дают приз.',
];

function VisualCard({
  title,
  value,
  caption,
  className = '',
}: {
  title: string;
  value: string;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 ring-1 ring-white/8 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_30%)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
          {title}
        </p>
        <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.07em] text-white">
          {value}
        </p>
        <p className="mt-3 max-w-[14rem] text-sm leading-6 text-stone-300">{caption}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#182430_0%,#0b1016_32%,#040608_100%)] text-white">
      <section className="mx-auto flex w-full max-w-[1380px] flex-col gap-8 px-4 py-8">
        <WorkspaceHero
          eyebrow="Gorilla Hockey"
          title="Школа, команда и платформа в одном спортивном продукте"
          description="Тренировки, команда, кабинет и promo-билеты собраны в один dark shell без CRM-перегруза."
          meta={
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100 ring-1 ring-white/10">
                Москва • Нижний Новгород
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-stone-200 ring-1 ring-white/10">
                School • Team • Platform
              </span>
            </div>
          }
          actions={
            <>
              <Link
                href="/cabinet"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-black transition hover:translate-y-[-1px] hover:bg-amber-300"
              >
                Войти в кабинет
              </Link>
              <a
                href="https://t.me/Gorillahockeyacademy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white/8 px-5 py-3 text-sm font-semibold text-stone-100 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white"
              >
                Telegram
              </a>
              <a
                href="tel:+79101301777"
                className="inline-flex items-center justify-center rounded-full bg-white/8 px-5 py-3 text-sm font-semibold text-stone-100 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white"
              >
                Позвонить
              </a>
            </>
          }
          asideLabel="О продукте"
          aside={
            <div className="space-y-2">
              <p>Gorilla объединяет школу, командный контур и пользовательский кабинет.</p>
              <p>NHL references используются как grammar: масштаб, иерархия, воздух и focal area.</p>
            </div>
          }
          media={
            <div className="relative h-full min-h-[360px] overflow-hidden bg-[linear-gradient(145deg,#05070a_0%,#0a1117_42%,#111c27_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(245,158,11,0.2),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_46%,transparent_47%),linear-gradient(160deg,transparent_0%,rgba(255,255,255,0.03)_52%,transparent_53%)]" />
              <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-black/28 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/10 backdrop-blur">
                  Arena shell
                </span>
                <span className="rounded-full bg-black/28 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-200 ring-1 ring-white/10 backdrop-blur">
                  Season 25/26
                </span>
              </div>
              <div className="absolute left-6 top-20 max-w-[15rem]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Club signal
                </p>
                <p className="mt-4 text-[3rem] font-semibold tracking-[-0.08em] text-white sm:text-[3.7rem]">
                  ONE
                  <br />
                  WORKSPACE
                </p>
              </div>
              <div className="absolute right-6 top-20 grid w-[46%] max-w-[19rem] gap-3">
                {laneItems.map((lane) => (
                  <div
                    key={lane.title}
                    className="rounded-[1.5rem] bg-black/24 px-4 py-4 ring-1 ring-white/8 backdrop-blur"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                      {lane.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{lane.text}</p>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-6 bottom-6 grid gap-3 sm:grid-cols-3">
                <VisualCard title="Skill" value="ICE" caption="Техника и повторение." />
                <VisualCard title="Club" value="TEAM" caption="Игровая среда и состав." />
                <VisualCard title="Access" value="APP" caption="Кабинет и staff-зона." />
              </div>
            </div>
          }
        />

        <WorkspaceCanvas className="space-y-10">
          <WorkspaceScoreStrip items={scoreItems} compact />

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_320px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <VisualCard
                title="School"
                value="01"
                caption="Катание, техника и системная работа над игроком."
                className="sm:col-span-2 xl:col-span-1"
              />
              <VisualCard
                title="Team"
                value="02"
                caption="Матчевая практика и клубный ритм."
              />
              <VisualCard
                title="Platform"
                value="03"
                caption="Кабинет, staff workspace и promo-модуль."
              />
            </div>

            <div className="space-y-5">
              <WorkspaceInset className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-300">
                  Быстрый вход
                </p>
                <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-white">
                  Действия сразу на первом экране
                </h2>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/cabinet"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-amber-100"
                  >
                    Открыть кабинет
                  </Link>
                  <Link
                    href="/promo-tickets"
                    className="inline-flex items-center justify-center rounded-full bg-white/8 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/12 transition hover:bg-white/12"
                  >
                    Открыть promo-билеты
                  </Link>
                </div>
              </WorkspaceInset>

              <WorkspaceDisclosure label="Как устроен продукт">
                <div className="space-y-3">
                  {laneItems.map((lane) => (
                    <div key={lane.title}>
                      <p className="font-semibold text-white">{lane.title}</p>
                      <p>{lane.text}</p>
                    </div>
                  ))}
                </div>
              </WorkspaceDisclosure>
            </div>
          </section>

          <section className="grid gap-8 border-t border-white/8 pt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
                    Club updates
                  </p>
                  <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">
                    Клубный ритм
                  </h2>
                </div>
                <WorkspaceDisclosure label="Почему так">
                  Главная держится на одной сцене, крупных визуальных опорах и коротких
                  действиях. Вторичная информация не конкурирует с CTA.
                </WorkspaceDisclosure>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {quickLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.8rem] bg-white/[0.03] p-5 ring-1 ring-white/7 transition hover:bg-white/[0.05]"
                  >
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.text}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-amber-300">
                      Читать
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <WorkspaceInset tone="accent" className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                Promo tickets
              </p>
              <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-white">
                Простая promo-механика
              </h2>
              <div className="mt-4 space-y-3">
                {promoSteps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/12 text-xs font-bold text-amber-100 ring-1 ring-amber-300/24">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-amber-100">{step}</p>
                  </div>
                ))}
              </div>
              <WorkspaceDisclosure label="Правила промо" className="mt-5">
                Модуль является promo-механикой и не предназначен для платных лотерей,
                ставок, азартных игр или продажи шанса на выигрыш без отдельной
                юридической проверки.
              </WorkspaceDisclosure>
            </WorkspaceInset>
          </section>
        </WorkspaceCanvas>
      </section>
    </main>
  );
}
