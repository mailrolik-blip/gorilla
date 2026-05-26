import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeLocationProps = {
  section: HomepageSchoolContent['locations'];
};

export function HomeLocation({ section }: HomeLocationProps) {
  return (
    <section id="location" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section-soft mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {section.items.map((item) => (
            <article
              key={item.city}
              className="home-ice-panel overflow-hidden rounded-[2.4rem]"
            >
              <div className="relative min-h-[240px] border-b border-[color:var(--gh-border)] bg-black/36">
                <Image src={item.image} alt={item.city} fill className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,16,0.08),rgba(8,12,16,0.52))]" />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--gh-accent)]">
                    {item.city}
                  </p>
                  <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-[color:var(--gh-text)]">
                    {item.address}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--gh-muted)]">
                    {item.note}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={item.routeHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
                  >
                    Построить маршрут
                  </a>
                  <a
                    href={item.phoneHref}
                    className="home-ice-chip inline-flex rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
                  >
                    Связаться
                  </a>
                </div>

                <details className="home-ice-panel-soft group rounded-[1.6rem] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text)]">
                    Расписание и формат
                    <span className="text-[color:var(--gh-muted)] transition group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                    {item.schedule.map((row) => (
                      <li key={row} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                        <span>{row}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
