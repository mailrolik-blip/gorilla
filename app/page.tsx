import type { Metadata } from 'next';

import { homepageSchoolContent } from '@/content/homepage-school';
import { getHomepageTelegramFeed } from '@/lib/telegram-news';

import { HomeDiscountGameSection } from '@/components/homepage-school/home-discount-game-section';
import { HomeFooter } from '@/components/homepage-school/home-footer';
import { HomeHeader } from '@/components/homepage-school/home-header';
import { HomeHero } from '@/components/homepage-school/home-hero';
import { HomeIceRent } from '@/components/homepage-school/home-ice-rent';
import { HomeLiveStreams } from '@/components/homepage-school/home-live-streams';
import { HomeLocation } from '@/components/homepage-school/home-location';
import { HomeNews } from '@/components/homepage-school/home-news';
import { HomeStats } from '@/components/homepage-school/home-stats';
import { HomeTeams } from '@/components/homepage-school/home-teams';
import { HomeTestimonials } from '@/components/homepage-school/home-testimonials';
import { HomeTrainers } from '@/components/homepage-school/home-trainers';
import { HomeTrainingTypes } from '@/components/homepage-school/home-training-types';

export const metadata: Metadata = {
  title: 'Детская хоккейная школа Gorilla Hockey',
  description:
    'Gorilla Hockey: хоккейная школа для детей, команды ЛХЛ, аренда льда, отзывы и миниигра на скидку.',
};

export default async function HomePage() {
  const newsFeed = await getHomepageTelegramFeed();
  const {
    site,
    menu,
    news,
    hero,
    stats,
    trainings,
    liveStreams,
    teams,
    trainers,
    iceRent,
    testimonials,
    discountGame,
    locations,
    footer,
  } = homepageSchoolContent;

  return (
    <main className="homepage-school-shell relative min-h-screen overflow-x-clip bg-[color:var(--gh-bg)] text-[color:var(--gh-text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07111a_0%,#09131f_34%,#04080d_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(53,102,143,0.3),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(201,24,43,0.16),transparent_18%),radial-gradient(circle_at_50%_108%,rgba(74,132,169,0.16),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(115deg,rgba(157,190,214,0.05)_0,rgba(157,190,214,0.05)_2px,transparent_2px,transparent_118px),repeating-linear-gradient(14deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_140px)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(158deg,transparent_0%,rgba(92,139,171,0.1)_44%,transparent_45%),linear-gradient(11deg,transparent_0%,rgba(201,24,43,0.08)_64%,transparent_65%)]" />
      </div>

      <HomeHeader menuItems={menu} site={site} />

      <div className="relative">
        <HomeHero hero={hero} />
        <HomeStats items={stats} />
        <HomeNews section={news} items={newsFeed} />
        <HomeLiveStreams section={liveStreams} />
        <HomeTrainingTypes section={trainings} />
        <HomeTeams section={teams} />
        <HomeTrainers section={trainers} />
        <HomeIceRent section={iceRent} />
        <HomeTestimonials section={testimonials} />
        <HomeDiscountGameSection section={discountGame} site={site} />
        <HomeLocation section={locations} />
        <HomeFooter footer={footer} site={site} />
      </div>
    </main>
  );
}
