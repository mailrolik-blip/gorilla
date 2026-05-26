import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeTeamsProps = {
  section: HomepageSchoolContent['teams'];
};

export function HomeTeams({ section }: HomeTeamsProps) {
  return (
    <section id="teams" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section-soft mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {section.items.map((team) => (
            <article
              key={team.teamName}
              className="home-ice-panel overflow-hidden rounded-[2.4rem]"
            >
              <div className="relative min-h-[340px] overflow-hidden">
                <Image
                  src={team.image}
                  alt={team.teamName}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,16,0.1),rgba(8,12,16,0.82))]" />
                <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gh-accent)] backdrop-blur">
                      {team.city}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 backdrop-blur">
                      Призёры ЛХЛ
                    </span>
                  </div>

                  <div className="max-w-lg space-y-3">
                    <h3 className="text-3xl font-black uppercase tracking-[-0.05em] text-white sm:text-4xl">
                      {team.teamName}
                    </h3>
                    <p className="max-w-xl text-sm leading-7 text-white/74">{team.description}</p>
                    <p className="max-w-xl text-sm font-semibold leading-7 text-white">
                      {team.achievement}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--gh-muted)]">
                    Галерея прошлых игр
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {team.gallery.map((item) => (
                      <figure key={item.title} className="space-y-2">
                        <div className="relative h-28 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/40">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <figcaption className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gh-muted)]">
                          {item.title}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>

                <div className="home-ice-panel-soft rounded-[1.8rem] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--gh-muted)]">
                    Матчи и результаты
                  </p>
                  <div className="mt-4 space-y-3">
                    {team.results.map((result) => (
                      <div
                        key={result.label}
                        className="home-ice-panel rounded-[1.2rem] px-4 py-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gh-muted)]">
                          {result.label}
                        </p>
                        <p className="mt-2 text-sm font-bold text-[color:var(--gh-text)]">{result.value}</p>
                      </div>
                    ))}
                  </div>

                  <a
                    href={team.ctaHref}
                    className="mt-4 inline-flex rounded-full bg-[color:var(--gh-accent)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
                  >
                    {team.ctaLabel}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
