'use client';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import { MiniHockeyDiscountGame } from '@/components/games/mini-hockey-discount-game';

type HomeDiscountGameSectionProps = {
  section: HomepageSchoolContent['discountGame'];
  site: HomepageSchoolContent['site'];
};

export function HomeDiscountGameSection({
  section,
}: HomeDiscountGameSectionProps) {
  return (
    <section
      id="discount-game"
      aria-label={section.title}
      className="relative scroll-mt-0 px-0 py-0"
    >
      <MiniHockeyDiscountGame />
    </section>
  );
}
