import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeHeroProps = {
  hero: HomepageSchoolContent['hero'];
};

export function HomeHero({ hero }: HomeHeroProps) {
  return (
    <section id="hero" className="scroll-mt-28 px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-6 xl:min-h-[calc(100svh-6.75rem)] xl:grid-cols-[minmax(0,0.84fr)_minmax(480px,1.16fr)] xl:items-center">
          <div className="space-y-5 pt-8 md:pt-12 xl:max-w-[38rem] xl:pt-14">
            <span className="inline-flex rounded-full border border-[color:var(--gh-border)] bg-[rgba(18,31,45,0.82)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
              {hero.eyebrow}
            </span>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-black uppercase tracking-[-0.06em] text-[color:var(--gh-text)] sm:text-6xl xl:text-[4.7rem]">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gh-muted)] sm:text-lg sm:leading-8">
                {hero.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="home-ice-chip rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gh-muted)]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={hero.primaryCta.href}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--gh-accent)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                {hero.primaryCta.label}
              </a>
              <Link
                href={hero.secondaryCta.href}
                className="home-ice-chip inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>

            <a
              href={hero.tertiaryCta.href}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-muted)] transition hover:text-[color:var(--gh-text)]"
            >
              {hero.tertiaryCta.label}
              <span aria-hidden="true">{'>'}</span>
            </a>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(220px,0.88fr)]">
            <div className="relative min-h-[430px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/60 shadow-[0_24px_100px_rgba(0,0,0,0.42)] sm:min-h-[500px]">
              <Image
                src={hero.primaryImage}
                alt="Ледовая сцена хоккейной школы Gorilla Hockey"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.06),rgba(6,10,14,0.62)_64%,rgba(6,10,14,0.92))]" />
              <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/72 backdrop-blur-md">
                    Набор открыт
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--gh-accent)] backdrop-blur-md">
                    Москва / Нижний
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="max-w-md rounded-[1.9rem] border border-white/10 bg-black/34 p-5 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/56">
                      Gorilla Hockey
                    </p>
                    <p className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-white sm:text-4xl">
                      От первого льда до матчей
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {hero.visualStats.map((item) => (
                      <div
                        key={`hero-${item.label}`}
                        className="rounded-[1.35rem] border border-white/10 bg-black/30 px-4 py-4 backdrop-blur-md"
                      >
                        <p className="text-xl font-black uppercase tracking-[-0.06em] text-white">
                          {item.value}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {hero.cards.map((card) => (
                <article
                  key={card.title}
                  className="group relative min-h-[210px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/60"
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.18),rgba(6,10,14,0.82))]" />
                  <div className="relative flex h-full flex-col justify-end p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
                      {card.eyebrow}
                    </p>
                    <p className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-white">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/72">{card.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
