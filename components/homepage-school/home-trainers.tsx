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

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {section.items.map((trainer, index) => (
            <article
              key={trainer.name}
              className="home-ice-panel relative overflow-hidden rounded-[2.2rem] p-4"
            >
              <div className="pointer-events-none absolute right-4 top-2 text-[4.2rem] font-black uppercase tracking-[-0.08em] text-[rgba(17,32,43,0.05)]">
                0{index + 1}
              </div>

              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/36">
                <Image src={trainer.image} alt={trainer.name} fill className="object-cover" />
                <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                    Тренер школы
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
                    {trainer.experience}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-muted)]">
                    {trainer.role}
                  </p>
                  <h3 className="mt-3 text-[1.7rem] font-black leading-tight tracking-[-0.04em] text-[color:var(--gh-text)]">
                    {trainer.name}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {trainer.specialization.map((item) => (
                    <span
                      key={item}
                      className="home-ice-chip rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <details className="home-ice-panel-soft group rounded-[1.4rem] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--gh-text)]">
                    Опыт и достижения
                    <span className="text-[color:var(--gh-muted)] transition group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--gh-muted)]">
                    {trainer.achievements.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                        <span>{item}</span>
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
