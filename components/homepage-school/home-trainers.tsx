import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeTrainersProps = {
  section: HomepageSchoolContent['trainers'];
};

export function HomeTrainers({ section }: HomeTrainersProps) {
  return (
    <section id="trainers" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {section.items.map((trainer, index) => (
            <article
              key={trainer.name}
              className="home-ice-panel relative flex h-full overflow-hidden rounded-[1.6rem] p-4"
            >
              <div className="pointer-events-none absolute right-5 top-3 text-[4.2rem] font-black uppercase tracking-[-0.08em] text-white/[0.04]">
                0{index + 1}
              </div>

              <div className="relative z-10 flex w-full flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-black/36">
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.36))]" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[color:var(--gh-accent)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[0_10px_30px_rgba(219,255,0,0.18)]">
                      {trainer.experience}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/78 backdrop-blur">
                      {trainer.age}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col">
                  <div>
                    <h3 className="max-w-[16rem] text-[1.55rem] font-black leading-[1.02] tracking-[-0.035em] text-[color:var(--gh-text)]">
                      {trainer.name}
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--gh-muted)]">
                      {trainer.role}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {trainer.specialization.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <details className="group mt-auto pt-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--gh-accent)] transition hover:bg-white/[0.08] [&::-webkit-details-marker]:hidden">
                      <span>Опыт и достижения</span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.08] text-base leading-none text-white/78 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <ul className="mt-4 space-y-3 px-1 text-sm leading-6 text-[color:var(--gh-muted)]">
                      {trainer.achievements.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
