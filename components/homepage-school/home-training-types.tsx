import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeTrainingTypesProps = {
  section: HomepageSchoolContent['trainings'];
};

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V8a2.5 2.5 0 0 1 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function HomeTrainingTypes({ section }: HomeTrainingTypesProps) {
  return (
    <section id="trainings" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section-soft mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          action={
            <Link
              href={section.cta.href}
              aria-label={section.cta.label}
              title={section.cta.label}
              className="group/calendar inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full border border-white/12 bg-white/[0.07] px-4 text-sm font-black uppercase tracking-[0.16em] text-white transition duration-300 hover:border-[color:var(--gh-accent)] hover:bg-[color:var(--gh-accent)] hover:px-6 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent)]"
            >
              <CalendarIcon />
              <span className="hidden max-w-0 whitespace-nowrap opacity-0 transition-all duration-300 group-hover/calendar:max-w-80 group-hover/calendar:opacity-100 group-focus/calendar:max-w-80 group-focus/calendar:opacity-100 sm:inline-block">
                {section.cta.label}
              </span>
            </Link>
          }
        />

        <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {section.items.map((item) => (
            <article
              key={item.title}
              className="group flex min-h-[500px] flex-col overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#070b0f]/92 shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-[#0a1016]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/28 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-2xl font-black uppercase tracking-[-0.05em] text-white sm:text-[1.65rem]">{item.price}</p>
                <h3 className="mt-3 text-xl font-black uppercase leading-none tracking-[-0.04em] text-white">{item.title}</h3>
                <p className="mt-2 min-h-[3rem] text-sm font-semibold leading-6 text-white/68">{item.subtitle}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/68"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <Link
                  href={item.ctaHref}
                  className="mt-auto inline-flex w-full justify-center rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {item.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
