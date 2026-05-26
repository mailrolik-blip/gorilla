import type { HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeTestimonialsProps = {
  section: HomepageSchoolContent['testimonials'];
};

export function HomeTestimonials({ section }: HomeTestimonialsProps) {
  return (
    <section id="testimonials" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section-soft mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading eyebrow={section.eyebrow} title={section.title} />

        <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2">
          {section.items.map((item, index) => (
            <article
              key={`${item.name}-${item.role}`}
              className={`home-ice-panel min-w-[290px] snap-start rounded-[2rem] p-5 sm:min-w-[340px] ${index % 2 === 1 ? 'md:mt-10' : ''}`}
            >
              <p className="text-lg font-semibold leading-8 text-[color:var(--gh-text)]">«{item.quote}»</p>
              <div className="mt-6 border-t border-[color:var(--gh-border)] pt-4">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--gh-text)]">{item.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-muted)]">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
