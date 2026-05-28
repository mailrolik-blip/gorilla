'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const HERO_SEQUENCE_BASE_PATH = '/homepage-school/hero-sequence';
const HERO_SEQUENCE_FRAMES = Array.from(
  { length: 17 },
  (_, index) => `${HERO_SEQUENCE_BASE_PATH}/123_000864${String(index).padStart(2, '0')}.jpg`
);
const HERO_SEQUENCE_DESKTOP_SHIFT = 70;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  mirrored = false,
  offsetX = 0
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawWidth = canvasHeight * imageRatio;
    drawX = (canvasWidth - drawWidth) / 2;
  } else {
    drawHeight = canvasWidth / imageRatio;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.save();

  if (mirrored) {
    context.translate(canvasWidth, 0);
    context.scale(-1, 1);
    context.drawImage(image, canvasWidth - drawX - offsetX - drawWidth, drawY, drawWidth, drawHeight);
  } else {
    context.drawImage(image, drawX + offsetX, drawY, drawWidth, drawHeight);
  }

  context.restore();
}

export function HomeHeroSequence() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const currentFrameRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const forceNextDrawRef = useRef(false);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvasContext = canvasElement.getContext('2d');

    if (!canvasContext) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;
    const context: CanvasRenderingContext2D = canvasContext;
    let mounted = true;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    }

    function drawFrame(frameIndex: number, force = false) {
      const normalizedFrameIndex = clamp(frameIndex, 0, HERO_SEQUENCE_FRAMES.length - 1);
      const image = frameImagesRef.current[normalizedFrameIndex];

      if (!image?.complete || image.naturalWidth === 0) {
        const fallbackFrameIndex = findNearestLoadedFrame(normalizedFrameIndex);

        if (fallbackFrameIndex !== null && fallbackFrameIndex !== normalizedFrameIndex) {
          drawFrame(fallbackFrameIndex, true);
        }

        return;
      }

      if (!force && currentFrameRef.current === normalizedFrameIndex) {
        return;
      }

      resizeCanvas();
      currentFrameRef.current = normalizedFrameIndex;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewportWidth = window.innerWidth || 0;
      const sequenceShift = viewportWidth >= 768 ? HERO_SEQUENCE_DESKTOP_SHIFT * dpr : 0;

      drawCover(context, image, canvas.width, canvas.height, true, sequenceShift);
    }

    function findNearestLoadedFrame(frameIndex: number) {
      for (let offset = 0; offset < HERO_SEQUENCE_FRAMES.length; offset += 1) {
        const previousIndex = frameIndex - offset;
        const nextIndex = frameIndex + offset;
        const previousImage = frameImagesRef.current[previousIndex];
        const nextImage = frameImagesRef.current[nextIndex];

        if (previousImage?.complete && previousImage.naturalWidth > 0) {
          return previousIndex;
        }

        if (nextImage?.complete && nextImage.naturalWidth > 0) {
          return nextIndex;
        }
      }

      return null;
    }

    function getFrameFromScroll() {
      const heroSection = canvas.closest<HTMLElement>('[data-hero-sequence-section]');

      if (!heroSection) {
        return 0;
      }

      const pageY = window.scrollY || window.pageYOffset || 0;
      const sectionTop = heroSection.offsetTop;
      const viewportHeight = window.innerHeight || 1;
      const scrollDistance = Math.max(heroSection.offsetHeight - viewportHeight, 1);
      const progress = clamp((pageY - sectionTop) / scrollDistance, 0, 1);

      const forwardFrameIndex = Math.round(progress * (HERO_SEQUENCE_FRAMES.length - 1));

      return HERO_SEQUENCE_FRAMES.length - 1 - forwardFrameIndex;
    }

    function scheduleDraw(force = false) {
      forceNextDrawRef.current = forceNextDrawRef.current || force;

      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const shouldForce = forceNextDrawRef.current;
        forceNextDrawRef.current = false;
        const nextFrame = getFrameFromScroll();
        drawFrame(nextFrame, shouldForce);
      });
    }

    HERO_SEQUENCE_FRAMES.forEach((src, index) => {
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
      image.onload = () => {
        if (!mounted) {
          return;
        }

        if (index === 0 || index === getFrameFromScroll()) {
          scheduleDraw(true);
        }
      };
      frameImagesRef.current[index] = image;
    });

    scheduleDraw(true);
    const handleScroll = () => {
      if ((window.scrollY || window.pageYOffset || 0) <= 2) {
        currentFrameRef.current = -1;
      }

      scheduleDraw(true);
    };
    const handleResize = () => scheduleDraw(true);
    const handleLoad = () => {
      currentFrameRef.current = -1;
      scheduleDraw(true);
    };
    const handleScrollEnd = () => {
      currentFrameRef.current = -1;
      scheduleDraw(true);
    };
    const handlePageShow = () => {
      currentFrameRef.current = -1;
      scheduleDraw(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        currentFrameRef.current = -1;
        scheduleDraw(true);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          currentFrameRef.current = -1;
          scheduleDraw(true);
        }
      },
      { threshold: [0, 0.08, 0.35, 0.75] }
    );

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd);
    window.addEventListener('load', handleLoad);
    window.addEventListener('resize', handleResize);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    observer.observe(canvas);

    return () => {
      mounted = false;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scrollend', handleScrollEnd);
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <Image
        src={HERO_SEQUENCE_FRAMES[0]}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="-scale-x-100 translate-x-0 object-cover md:translate-x-[70px]"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
