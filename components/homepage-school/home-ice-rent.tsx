import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeIceRentProps = {
  section: HomepageSchoolContent['iceRent'];
};

export function HomeIceRent({ section }: HomeIceRentProps) {
  return (
    <section id="rent" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="home-ice-section grid gap-7 overflow-hidden p-5 sm:p-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(24rem,0.75fr)] xl:items-stretch">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2.1rem] border border-white/10 bg-black/40">
            <Image src={section.image} alt={section.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,16,0.08),rgba(8,12,16,0.46)_72%,rgba(8,12,16,0.78))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/10 bg-black/28 p-4 backdrop-blur-md sm:left-6 sm:right-auto sm:max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
                Быстрый слот
              </p>
              <p className="mt-2 text-sm leading-7 text-white/76">
                Командная тренировка, просмотр, индивидуальная работа или семейный формат.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[color:var(--gh-accent)]">
              {section.eyebrow}
            </p>
            <h2 className="text-4xl font-black uppercase tracking-[-0.05em] text-[color:var(--gh-text)] sm:text-5xl">
              {section.title}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--gh-muted)] sm:text-base">
              {section.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={section.primaryCta.href}
                className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                {section.primaryCta.label}
              </Link>
              <a
                href={section.secondaryCta.href}
                className="home-ice-chip inline-flex rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {section.secondaryCta.label}
              </a>
            </div>

            <div className="home-ice-panel-soft rounded-[1.6rem] p-4">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text)]">
                Условия аренды
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                {section.details.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
