import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeHeroSequence } from './home-hero-sequence';

type HomeHeroProps = {
  hero: HomepageSchoolContent['hero'];
};

export function HomeHero({ hero }: HomeHeroProps) {
  return (
    <section
      id="hero"
      data-hero-sequence-section
      className="relative min-h-[170svh] scroll-mt-0"
    >
      <div className="sticky top-0 min-h-[100svh] overflow-hidden">
        <HomeHeroSequence />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,12,0.92)_0%,rgba(3,7,12,0.72)_34%,rgba(3,7,12,0.28)_66%,rgba(3,7,12,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,12,0.68)_0%,rgba(3,7,12,0.16)_34%,rgba(6,16,24,0.54)_76%,rgba(6,16,24,0.9)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-center px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="max-w-[48rem] space-y-4">
            <span className="inline-flex rounded-full border border-white/12 bg-black/38 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--gh-accent)] backdrop-blur-md">
              {hero.eyebrow}
            </span>

            <div className="space-y-4">
              <h1 className="max-w-5xl text-4xl font-black uppercase leading-[0.96] text-white drop-shadow-[0_16px_42px_rgba(0,0,0,0.55)] sm:text-6xl xl:text-[5rem]">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/82 drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:text-lg sm:leading-8">
                {hero.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/12 bg-black/32 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/78 backdrop-blur-md"
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
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-black/32 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/12"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>

            <a
              href={hero.tertiaryCta.href}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:text-white"
            >
              {hero.tertiaryCta.label}
              <span aria-hidden="true">{'>'}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[46svh] bg-[linear-gradient(180deg,rgba(6,16,24,0)_0%,rgba(7,17,26,0.34)_32%,rgba(8,18,28,0.82)_68%,#061018_100%)]" />
    </section>
  );
}
