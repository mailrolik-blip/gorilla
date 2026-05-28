import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent, HomepageTrainingType } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeTrainingTypesProps = {
  section: HomepageSchoolContent['trainings'];
};

function getTrainingCardSpan(item: HomepageTrainingType) {
  if (item.featured) {
    return 'xl:col-span-6 xl:row-span-2 min-h-[520px]';
  }

  return 'xl:col-span-3 min-h-[240px]';
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
              className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              {section.cta.label}
            </Link>
          }
        />

        <div className="mt-10 grid gap-4 xl:grid-cols-12 xl:auto-rows-[minmax(180px,1fr)]">
          {section.items.map((item) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-[2.1rem] border border-white/10 bg-black/62 ${getTrainingCardSpan(item)}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.12),rgba(6,10,14,0.82)_68%,rgba(6,10,14,0.96))]" />
              <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
                  {item.audience}
                </p>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-white sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/74">{item.subtitle}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                    {item.price}
                  </span>
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/12 bg-black/26 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="mt-5">
                  <Link
                    href={item.ctaHref}
                    className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110"
                  >
                    {item.ctaLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
