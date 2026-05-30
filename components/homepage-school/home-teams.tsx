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

        <div className="mt-10 grid gap-7 xl:grid-cols-2">
          {section.items.map((team) => (
            <article
              key={team.teamName}
              className="home-ice-panel overflow-hidden rounded-[2.2rem] p-4 sm:p-5"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40 sm:aspect-[16/9]">
                <Image
                  src={team.image}
                  alt={team.teamName}
                  fill
                  priority={team.city === 'Москва'}
                  sizes="(min-width: 1280px) 690px, (min-width: 768px) 92vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.58))] p-4 sm:p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gh-accent)] backdrop-blur">
                      {team.city}
                    </span>
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/76 backdrop-blur">
                      {team.league}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {team.gallery.map((item) => (
                  <a
                    key={item.title}
                    href={item.image}
                    target="_blank"
                    rel="noreferrer"
                    className="group min-w-[8.5rem] overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/35 sm:min-w-[10rem]"
                    aria-label={`Открыть фото: ${item.title}`}
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="160px"
                        className="object-cover transition duration-500 group-hover:scale-[1.05]"
                      />
                    </span>
                    <span className="block truncate px-3 py-2 text-[11px] font-semibold text-white/70">
                      {item.title}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
                    {team.teamName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{team.description}</p>
                </div>

                <dl className="grid gap-x-5 gap-y-3 border-y border-white/10 py-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-muted)]">
                      Лига
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-white">{team.league}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-muted)]">
                      Статус
                    </dt>
                    <dd className="mt-1 text-sm font-bold leading-6 text-white">{team.achievement}</dd>
                  </div>
                  {team.results.map((result) => (
                    <div key={result.label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-muted)]">
                        {result.label}
                      </dt>
                      <dd className="mt-1 text-sm font-bold leading-6 text-white">{result.value}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--gh-accent)]">
                      Состав команды
                    </p>
                    <a
                      href={team.ctaHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-black uppercase tracking-[0.16em] text-white/55 transition hover:text-[color:var(--gh-accent)]"
                    >
                      Весь состав
                    </a>
                  </div>

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {team.players.map((player) => (
                      <li
                        key={player}
                        className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/74"
                      >
                        {player}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
