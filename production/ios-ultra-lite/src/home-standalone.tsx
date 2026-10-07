import React, { useEffect, useRef, useState } from 'react';

import { homepageSchoolContent } from '/opt/gorilla/content/homepage-school';

import { HomeHeroStandalone } from '/opt/gorilla-react-home/home-hero-standalone';

import { HomeDiscountGameSection } from '/opt/gorilla/components/homepage-school/home-discount-game-section';
import { HomeFooter } from '/opt/gorilla/components/homepage-school/home-footer';
import { HomeHeader } from '/opt/gorilla/components/homepage-school/home-header';
import { HomeIceRent } from '/opt/gorilla/components/homepage-school/home-ice-rent';
import { HomeLocation } from '/opt/gorilla/components/homepage-school/home-location';
import { HomeMediaFeed } from '/opt/gorilla/components/homepage-school/home-media-feed';
import { HomeTeams } from '/opt/gorilla/components/homepage-school/home-teams';
import { HomeTestimonials } from '/opt/gorilla/components/homepage-school/home-testimonials';
import { HomeTrainers } from '/opt/gorilla/components/homepage-school/home-trainers';
import { HomeTrainingTypes } from '/opt/gorilla/components/homepage-school/home-training-types';

function DeferredMount({
  children,
  minHeight,
  hashes = [],
  rootMargin = '350px 0px',
}: {
  children: React.ReactNode;
  minHeight: string;
  hashes?: string[];
  rootMargin?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const hashKey = hashes.join('|');

  useEffect(() => {
    if (mounted) return;

    function wantsHash() {
      if (hashes.includes(window.location.hash)) {
        setMounted(true);
        return true;
      }

      return false;
    }

    if (wantsHash()) return;

    const node = hostRef.current;

    if (!node || !('IntersectionObserver' in window)) {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(node);

    const handleHash = () => {
      if (wantsHash()) {
        observer.disconnect();
      }
    };

    window.addEventListener('hashchange', handleHash);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', handleHash);
    };
  }, [mounted, rootMargin, hashKey]);

  useEffect(() => {
    if (!mounted) return;

    const hash = window.location.hash;

    if (hashes.includes(hash)) {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView();
      });
    }
  }, [mounted, hashKey]);

  return (
    <div
      ref={hostRef}
      style={!mounted ? { minHeight } : undefined}
    >
      {mounted ? children : null}
    </div>
  );
}

export default function HomeStandalone() {
  const {
    site,
    menu,
    news,
    hero,
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
      </div>

      <HomeHeader menuItems={menu} site={site} />

      <div className="relative">

        <HomeHeroStandalone hero={hero} />

        <DeferredMount
          minHeight="110svh"
          hashes={['#stories', '#news']}
          rootMargin="250px 0px"
        >
          <HomeMediaFeed
            news={news}
            liveStreams={liveStreams}
          />
        </DeferredMount>

        <DeferredMount
          minHeight="90svh"
          hashes={['#trainings']}
        >
          <HomeTrainingTypes section={trainings} />
        </DeferredMount>

        <DeferredMount
          minHeight="90svh"
          hashes={['#teams']}
        >
          <HomeTeams section={teams} />
        </DeferredMount>

        <DeferredMount
          minHeight="80svh"
          hashes={['#trainers']}
        >
          <HomeTrainers section={trainers} />
        </DeferredMount>

        <DeferredMount
          minHeight="75svh"
          hashes={['#rent']}
        >
          <HomeIceRent section={iceRent} />
        </DeferredMount>

        <DeferredMount
          minHeight="70svh"
          hashes={['#testimonials']}
        >
          <HomeTestimonials section={testimonials} />
        </DeferredMount>

        <DeferredMount
          minHeight="70svh"
          hashes={['#gorilla-mini-game']}
          rootMargin="300px 0px"
        >
          <HomeDiscountGameSection
            section={discountGame}
            site={site}
          />
        </DeferredMount>

        <DeferredMount
          minHeight="70svh"
          hashes={['#location']}
        >
          <HomeLocation section={locations} />
        </DeferredMount>

        <DeferredMount
          minHeight="40svh"
        >
          <HomeFooter
            footer={footer}
            site={site}
          />
        </DeferredMount>

      </div>
    </main>
  );
}
