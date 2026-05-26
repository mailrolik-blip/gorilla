'use client';

import Link from 'next/link';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { useGorillaAccount } from '@/components/gorilla-account-provider';

const ARENA_W = 900;
const ARENA_H = 520;
const PLAYER_R = 26;
const PUCK_R = 14;
const GOAL_H = 150;
const GAME_TIME = 60;
const emptyKeys = { up: false, down: false, left: false, right: false };
const emptyAxis = { x: 0, y: 0 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function length(x, y) {
  return Math.sqrt(x * x + y * y);
}

function getFullscreenElement() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

function supportsBrowserFullscreen(element) {
  if (!element || typeof document === 'undefined') {
    return false;
  }

  return Boolean(
    document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      element.requestFullscreen ||
      element.webkitRequestFullscreen
  );
}

async function requestElementFullscreen(element) {
  if (!element) {
    return false;
  }

  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return true;
  }

  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    return true;
  }

  return false;
}

async function exitBrowserFullscreen() {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }

  if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

async function tryLockLandscapeOrientation() {
  if (typeof window === 'undefined') {
    return false;
  }

  const orientationApi = window.screen?.orientation;

  if (!orientationApi?.lock) {
    return false;
  }

  try {
    await orientationApi.lock('landscape');
    return true;
  } catch {
    return false;
  }
}

function unlockLandscapeOrientation() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.screen?.orientation?.unlock) {
    window.screen.orientation.unlock();
  }
}

function getDefaultMessage(isAuthenticated) {
  return isAuthenticated
    ? 'Игровой режим готов. Старт матча открывается на весь экран.'
    : 'Играть можно и гостем, но для сохранения Gorilla Points нужен вход в кабинет.';
}

function getFinishedMessage(score, isAuthenticated) {
  if (score.user > score.bot) {
    return isAuthenticated
      ? 'Победа. Баллы за голы уже в аккаунте.'
      : 'Победа. Войдите, чтобы сохранять Gorilla Points после следующих матчей.';
  }

  if (score.user === score.bot) {
    return isAuthenticated
      ? 'Ничья. Баллы за голы всё равно сохранены.'
      : 'Ничья. Голы засчитаны только в гостевой сессии.';
  }

  return 'Матч завершён. Сыграй ещё и добери Gorilla Points.';
}

function VirtualJoystick({ onAxisChange }) {
  const [thumb, setThumb] = useState({ x: 0, y: 0, active: false });
  const baseRef = useRef(null);
  const pointerIdRef = useRef(null);
  const cleanupRef = useRef(() => {});

  function resetStick() {
    pointerIdRef.current = null;
    cleanupRef.current();
    cleanupRef.current = () => {};
    setThumb({ x: 0, y: 0, active: false });
    onAxisChange(emptyAxis);
  }

  function updateStick(clientX, clientY) {
    if (!baseRef.current) {
      return;
    }

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2 - 18;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.max(length(dx, dy), 0.001);

    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }

    setThumb({ x: dx, y: dy, active: true });
    onAxisChange({
      x: clamp(dx / radius, -1, 1),
      y: clamp(dy / radius, -1, 1),
    });
  }

  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);

  return (
    <div className="pointer-events-auto flex flex-col items-start gap-2">
      <p className="rounded-full border border-white/10 bg-black/34 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/74">
        move
      </p>
      <div
        ref={baseRef}
        onPointerDown={(event) => {
          event.preventDefault();

          if (pointerIdRef.current !== null) {
            return;
          }

          pointerIdRef.current = event.pointerId;
          updateStick(event.clientX, event.clientY);

          const handlePointerMove = (moveEvent) => {
            if (moveEvent.pointerId !== pointerIdRef.current) {
              return;
            }

            moveEvent.preventDefault();
            updateStick(moveEvent.clientX, moveEvent.clientY);
          };

          const handlePointerEnd = (endEvent) => {
            if (endEvent.pointerId !== pointerIdRef.current) {
              return;
            }

            resetStick();
          };

          window.addEventListener('pointermove', handlePointerMove, { passive: false });
          window.addEventListener('pointerup', handlePointerEnd);
          window.addEventListener('pointercancel', handlePointerEnd);

          cleanupRef.current = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerEnd);
            window.removeEventListener('pointercancel', handlePointerEnd);
          };
        }}
        className="relative h-36 w-36 touch-none select-none rounded-full border border-white/12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.28))] shadow-[0_20px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <div className="absolute inset-4 rounded-full border border-white/8" />
        <div className="absolute left-1/2 top-1/2 h-px w-[74%] -translate-x-1/2 -translate-y-1/2 bg-white/8" />
        <div className="absolute left-1/2 top-1/2 h-[74%] w-px -translate-x-1/2 -translate-y-1/2 bg-white/8" />
        <div
          className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/44 bg-[color:var(--gh-accent)] shadow-[0_14px_34px_rgba(245,158,11,0.32)] transition ${thumb.active ? 'scale-105' : ''}`}
          style={{
            transform: `translate(calc(-50% + ${thumb.x}px), calc(-50% + ${thumb.y}px))`,
          }}
        />
      </div>
    </div>
  );
}

export default function GorillaMiniHockey() {
  const {
    authStatus,
    isAuthenticated,
    pointsBalance,
    guestPreviewPoints,
    nextReward,
    unlockedRewards,
    awardGoalPoint,
  } = useGorillaAccount();

  const [gameModeOpen, setGameModeOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [viewState, setViewState] = useState('ready');
  const [score, setScore] = useState({ user: 0, bot: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [message, setMessage] = useState(getDefaultMessage(isAuthenticated));
  const [goalPopup, setGoalPopup] = useState(null);
  const [pointsFlyKey, setPointsFlyKey] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isLandscapeViewport, setIsLandscapeViewport] = useState(true);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState(null);
  const [arenaSnapshot, setArenaSnapshot] = useState({
    player: {
      x: 150,
      y: ARENA_H / 2,
    },
    bot: {
      x: ARENA_W - 150,
      y: ARENA_H / 2,
    },
    puck: {
      x: ARENA_W / 2,
      y: ARENA_H / 2,
    },
  });

  const overlayRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const countdownRef = useRef(0);
  const keysRef = useRef({ ...emptyKeys });
  const axisRef = useRef({ ...emptyAxis });
  const scoreRef = useRef(score);
  const runningRef = useRef(running);
  const viewStateRef = useRef(viewState);
  const gameModeOpenRef = useRef(gameModeOpen);
  const isBrowserFullscreenRef = useRef(isBrowserFullscreen);
  const isMobileViewportRef = useRef(isMobileViewport);
  const isLandscapeViewportRef = useRef(isLandscapeViewport);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const wasBrowserFullscreenRef = useRef(false);
  const skipNextFullscreenChangeRef = useRef(false);
  const pendingFullscreenRequestRef = useRef(false);

  const playerRef = useRef({
    x: 150,
    y: ARENA_H / 2,
    vx: 0,
    vy: 0,
  });
  const botRef = useRef({
    x: ARENA_W - 150,
    y: ARENA_H / 2,
    vx: 0,
    vy: 0,
  });
  const puckRef = useRef({
    x: ARENA_W / 2,
    y: ARENA_H / 2,
    vx: 0,
    vy: 0,
  });

  const visiblePointsBalance = isAuthenticated ? pointsBalance : guestPreviewPoints;
  const pointsLabel = isAuthenticated ? `${pointsBalance} GP` : `${guestPreviewPoints} GP`;
  const needsRotateHint = gameModeOpen && isMobileViewport && !isLandscapeViewport;

  function syncArenaSnapshot() {
    setArenaSnapshot({
      player: {
        x: playerRef.current.x,
        y: playerRef.current.y,
      },
      bot: {
        x: botRef.current.x,
        y: botRef.current.y,
      },
      puck: {
        x: puckRef.current.x,
        y: puckRef.current.y,
      },
    });
  }

  function resetBodies(withKickoff = true) {
    playerRef.current = {
      x: 150,
      y: ARENA_H / 2,
      vx: 0,
      vy: 0,
    };
    botRef.current = {
      x: ARENA_W - 150,
      y: ARENA_H / 2,
      vx: 0,
      vy: 0,
    };

    const direction = Math.random() > 0.5 ? 1 : -1;

    puckRef.current = {
      x: ARENA_W / 2,
      y: ARENA_H / 2 + (Math.random() * 80 - 40),
      vx: withKickoff ? 240 * direction : 0,
      vy: withKickoff ? Math.random() * 140 - 70 : 0,
    };
  }

  function resetMatch(nextMessage = getDefaultMessage(isAuthenticated)) {
    setRunning(false);
    setViewState('ready');
    setScore({ user: 0, bot: 0 });
    setTimeLeft(GAME_TIME);
    setMessage(nextMessage);
    setGoalPopup(null);
    setFullscreenNotice(null);
    countdownRef.current = 0;
    lastTsRef.current = null;
    keysRef.current = { ...emptyKeys };
    axisRef.current = { ...emptyAxis };
    scoreRef.current = { user: 0, bot: 0 };
    resetBodies(false);
    syncArenaSnapshot();
  }

  async function ensureBrowserFullscreen() {
    if (!overlayRef.current) {
      return false;
    }

    if (getFullscreenElement()) {
      setIsBrowserFullscreen(true);
      return true;
    }

    if (!supportsBrowserFullscreen(overlayRef.current)) {
      setFullscreenNotice('Браузер не поддерживает системный fullscreen. Игра открыта в изолированном fullscreen-режиме поверх страницы.');
      return false;
    }

    try {
      const entered = await requestElementFullscreen(overlayRef.current);

      if (entered) {
        setIsBrowserFullscreen(true);
        setFullscreenNotice(null);
        return true;
      }
    } catch {
      // Ignore and fall back to immersive overlay below.
    }

    setFullscreenNotice('Браузер не дал системный fullscreen, но игра уже открыта в отдельном игровом режиме без интерфейса страницы.');
    return false;
  }

  function pauseMatch(reason = 'Пауза.') {
    setRunning(false);
    setViewState('paused');
    setMessage(reason);
  }

  function startMatch() {
    if (viewStateRef.current === 'finished') {
      setScore({ user: 0, bot: 0 });
      scoreRef.current = { user: 0, bot: 0 };
      setTimeLeft(GAME_TIME);
    }

    resetBodies(true);
    syncArenaSnapshot();
    countdownRef.current = 0;
    lastTsRef.current = null;
    setGoalPopup(null);
    setRunning(true);
    setViewState('playing');
    setMessage('Матч начался. Забирай темп и дави на ворота.');
  }

  async function closeGameMode({ fromFullscreenExit = false } = {}) {
    setGameModeOpen(false);
    setIsBrowserFullscreen(false);
    pendingFullscreenRequestRef.current = false;
    resetMatch(getDefaultMessage(isAuthenticatedRef.current));
    unlockLandscapeOrientation();

    if (!fromFullscreenExit && getFullscreenElement()) {
      skipNextFullscreenChangeRef.current = true;

      try {
        await exitBrowserFullscreen();
      } catch {
        skipNextFullscreenChangeRef.current = false;
      }
    }
  }

  function handleGoalFeedback(title, detail, tone) {
    setGoalPopup({
      id: Date.now(),
      title,
      detail,
      tone,
    });
  }

  function kickPuck(player, puck, boost = 1) {
    const dx = puck.x - player.x;
    const dy = puck.y - player.y;
    const dist = Math.max(length(dx, dy), 0.001);
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = PLAYER_R + PUCK_R - dist;

    if (overlap <= 0) {
      return;
    }

    puck.x += nx * (overlap + 1);
    puck.y += ny * (overlap + 1);

    const relativeVx = puck.vx - player.vx;
    const relativeVy = puck.vy - player.vy;
    const relDot = relativeVx * nx + relativeVy * ny;
    const impulse = Math.max(280, 420 + relDot * -0.4) * boost;

    puck.vx = nx * impulse + player.vx * 0.6;
    puck.vy = ny * impulse + player.vy * 0.6;
  }

  function scoreGoal(side) {
    if (side === 'user') {
      const awardResult = awardGoalPoint();
      const nextScore = {
        ...scoreRef.current,
        user: scoreRef.current.user + 1,
      };

      setScore(nextScore);
      scoreRef.current = nextScore;
      setPointsFlyKey((value) => value + 1);

      if (awardResult.savedToAccount) {
        const unlockedTitle =
          awardResult.unlockedRewards.length > 0
            ? awardResult.unlockedRewards[0].title
            : `Баланс: ${awardResult.nextBalance} GP`;

        setMessage(
          awardResult.unlockedRewards.length > 0
            ? `Гол. Доступна новая награда: ${awardResult.unlockedRewards[0].title}.`
            : `Гол. +1 GP уже в аккаунте.`
        );
        handleGoalFeedback('+1 Gorilla Point', unlockedTitle, awardResult.unlockedRewards.length > 0 ? 'accent' : 'success');
      } else {
        setMessage('Гол. Войдите, чтобы сохранять Gorilla Points после следующих матчей.');
        handleGoalFeedback('+1 в сессии', 'Войдите, чтобы сохранить баллы', 'default');
      }
    } else {
      const nextScore = {
        ...scoreRef.current,
        bot: scoreRef.current.bot + 1,
      };

      setScore(nextScore);
      scoreRef.current = nextScore;
      setMessage('Пропустили. Верните шайбу под контроль и отвечайте атакой.');
      handleGoalFeedback('Шайба у соперника', 'Есть время отыграться', 'default');
    }

    resetBodies(true);
    syncArenaSnapshot();
  }

  function updateBodies(dt) {
    const player = playerRef.current;
    const bot = botRef.current;
    const puck = puckRef.current;
    const keys = keysRef.current;
    const axis = axisRef.current;

    const accel = 1500;
    const maxSpeed = 410;
    const friction = 0.9;

    let ax = axis.x * accel;
    let ay = axis.y * accel;

    if (keys.left) ax -= accel;
    if (keys.right) ax += accel;
    if (keys.up) ay -= accel;
    if (keys.down) ay += accel;

    player.vx += ax * dt;
    player.vy += ay * dt;

    player.vx *= Math.pow(friction, dt * 60 * 0.55);
    player.vy *= Math.pow(friction, dt * 60 * 0.55);

    const playerSpeed = length(player.vx, player.vy);

    if (playerSpeed > maxSpeed) {
      player.vx = (player.vx / playerSpeed) * maxSpeed;
      player.vy = (player.vy / playerSpeed) * maxSpeed;
    }

    const botTargetX = puck.x > ARENA_W * 0.58 ? puck.x - 30 : ARENA_W - 150;
    const botTargetY = puck.y;
    const botAx = clamp((botTargetX - bot.x) * 8.5, -1200, 1200);
    const botAy = clamp((botTargetY - bot.y) * 8.5, -1200, 1200);

    bot.vx += botAx * dt;
    bot.vy += botAy * dt;

    const botMaxSpeed = 360;
    const botSpeed = length(bot.vx, bot.vy);

    if (botSpeed > botMaxSpeed) {
      bot.vx = (bot.vx / botSpeed) * botMaxSpeed;
      bot.vy = (bot.vy / botSpeed) * botMaxSpeed;
    }

    bot.vx *= Math.pow(0.92, dt * 60 * 0.5);
    bot.vy *= Math.pow(0.92, dt * 60 * 0.5);

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    bot.x += bot.vx * dt;
    bot.y += bot.vy * dt;

    player.x = clamp(player.x, PLAYER_R + 10, ARENA_W / 2 - PLAYER_R - 18);
    player.y = clamp(player.y, PLAYER_R + 10, ARENA_H - PLAYER_R - 10);
    bot.x = clamp(bot.x, ARENA_W / 2 + PLAYER_R + 18, ARENA_W - PLAYER_R - 10);
    bot.y = clamp(bot.y, PLAYER_R + 10, ARENA_H - PLAYER_R - 10);

    const dx = bot.x - player.x;
    const dy = bot.y - player.y;
    const dist = length(dx, dy);
    const minDist = PLAYER_R * 2;

    if (dist < minDist && dist > 0) {
      const overlap = (minDist - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;

      player.x -= nx * overlap;
      player.y -= ny * overlap;
      bot.x += nx * overlap;
      bot.y += ny * overlap;
    }

    kickPuck(player, puck, 1.06);
    kickPuck(bot, puck, 0.98);

    puck.x += puck.vx * dt;
    puck.y += puck.vy * dt;
    puck.vx *= Math.pow(0.992, dt * 60);
    puck.vy *= Math.pow(0.992, dt * 60);

    if (puck.y - PUCK_R <= 0) {
      puck.y = PUCK_R;
      puck.vy *= -0.96;
    }

    if (puck.y + PUCK_R >= ARENA_H) {
      puck.y = ARENA_H - PUCK_R;
      puck.vy *= -0.96;
    }

    const goalTop = ARENA_H / 2 - GOAL_H / 2;
    const goalBottom = ARENA_H / 2 + GOAL_H / 2;
    const inGoalLane = puck.y > goalTop && puck.y < goalBottom;

    if (puck.x - PUCK_R <= 0) {
      if (inGoalLane) {
        scoreGoal('bot');
      } else {
        puck.x = PUCK_R;
        puck.vx *= -0.98;
      }
    }

    if (puck.x + PUCK_R >= ARENA_W) {
      if (inGoalLane) {
        scoreGoal('user');
      } else {
        puck.x = ARENA_W - PUCK_R;
        puck.vx *= -0.98;
      }
    }
  }

  const stepFrame = useEffectEvent(function handleFrame(timestamp) {
    if (lastTsRef.current == null) {
      lastTsRef.current = timestamp;
    }

    let dt = (timestamp - lastTsRef.current) / 1000;
    lastTsRef.current = timestamp;
    dt = Math.min(dt, 0.022);

    updateBodies(dt);
    countdownRef.current += dt;

    if (countdownRef.current >= 1) {
      countdownRef.current -= 1;

      setTimeLeft((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          setRunning(false);
          setViewState('finished');
          setMessage(getFinishedMessage(scoreRef.current, isAuthenticatedRef.current));
          return 0;
        }

        return next;
      });
    }

    syncArenaSnapshot();
    rafRef.current = requestAnimationFrame(handleFrame);
  });

  async function openGameMode() {
    resetMatch('Открываем игровой режим. Матч стартует только после разворота на весь экран.');
    setGameModeOpen(true);
    pendingFullscreenRequestRef.current = true;
  }

  async function beginMatchFlow() {
    const needsRotate =
      gameModeOpenRef.current &&
      isMobileViewportRef.current &&
      !isLandscapeViewportRef.current;

    if (needsRotate) {
      setMessage('Поверните устройство горизонтально, чтобы начать матч.');
      return;
    }

    if (!isBrowserFullscreenRef.current) {
      await ensureBrowserFullscreen();
    }

    await tryLockLandscapeOrientation();
    startMatch();
  }

  async function resumeMatch() {
    const needsRotate =
      gameModeOpenRef.current &&
      isMobileViewportRef.current &&
      !isLandscapeViewportRef.current;

    if (needsRotate) {
      setMessage('Поверните устройство горизонтально, чтобы продолжить матч.');
      return;
    }

    if (!isBrowserFullscreenRef.current) {
      await ensureBrowserFullscreen();
    }

    setRunning(true);
    setViewState('playing');
    setMessage('Матч продолжается. Возвращайтесь в темп.');
  }

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  useEffect(() => {
    gameModeOpenRef.current = gameModeOpen;
  }, [gameModeOpen]);

  useEffect(() => {
    isBrowserFullscreenRef.current = isBrowserFullscreen;
  }, [isBrowserFullscreen]);

  useEffect(() => {
    isMobileViewportRef.current = isMobileViewport;
  }, [isMobileViewport]);

  useEffect(() => {
    isLandscapeViewportRef.current = isLandscapeViewport;
  }, [isLandscapeViewport]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    wasBrowserFullscreenRef.current = isBrowserFullscreen;
  }, [isBrowserFullscreen]);

  useEffect(() => {
    resetBodies(false);
    syncArenaSnapshot();
  }, []);

  useEffect(() => {
    if (!goalPopup) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGoalPopup(null);
    }, 980);

    return () => window.clearTimeout(timeoutId);
  }, [goalPopup]);

  useEffect(() => {
    const viewportQuery = window.matchMedia('(max-width: 767px)');
    const orientationQuery = window.matchMedia('(orientation: landscape)');

    const applyViewportState = () => {
      const mobile = viewportQuery.matches;
      const landscape = mobile ? orientationQuery.matches : true;

      setIsMobileViewport(mobile);
      setIsLandscapeViewport(landscape);

      if (mobile && !landscape && runningRef.current) {
        pauseMatch('Поверните устройство горизонтально, чтобы продолжить матч.');
      }
    };

    applyViewportState();
    viewportQuery.addEventListener('change', applyViewportState);
    orientationQuery.addEventListener('change', applyViewportState);

    return () => {
      viewportQuery.removeEventListener('change', applyViewportState);
      orientationQuery.removeEventListener('change', applyViewportState);
    };
  }, []);

  useEffect(() => {
    if (!gameModeOpen) {
      document.documentElement.classList.remove('gorilla-game-mode');
      document.body.classList.remove('gorilla-game-mode');
      return;
    }

    document.documentElement.classList.add('gorilla-game-mode');
    document.body.classList.add('gorilla-game-mode');

    return () => {
      document.documentElement.classList.remove('gorilla-game-mode');
      document.body.classList.remove('gorilla-game-mode');
    };
  }, [gameModeOpen]);

  const handleFullscreenChange = useEffectEvent(() => {
    const fullscreenElement = getFullscreenElement();
    const isActive = Boolean(
      fullscreenElement &&
        overlayRef.current &&
        (fullscreenElement === overlayRef.current ||
          overlayRef.current.contains(fullscreenElement))
    );

    if (!isActive && skipNextFullscreenChangeRef.current) {
      skipNextFullscreenChangeRef.current = false;
    }

    setIsBrowserFullscreen(isActive);

    if (!isActive && wasBrowserFullscreenRef.current && gameModeOpenRef.current) {
      void closeGameMode({ fromFullscreenExit: true });
    }
  });

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!gameModeOpen || !pendingFullscreenRequestRef.current) {
      return;
    }

    pendingFullscreenRequestRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      void ensureBrowserFullscreen();
      void tryLockLandscapeOrientation();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [gameModeOpen]);

  const handleKeyDown = useEffectEvent((event) => {
    if (!gameModeOpenRef.current) {
      return;
    }

    const key = event.key.toLowerCase();

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', ' '].includes(key)) {
      event.preventDefault();
    }

    if (key === 'arrowup' || key === 'w' || key === 'ц') keysRef.current.up = true;
    if (key === 'arrowdown' || key === 's' || key === 'ы') keysRef.current.down = true;
    if (key === 'arrowleft' || key === 'a' || key === 'ф') keysRef.current.left = true;
    if (key === 'arrowright' || key === 'd' || key === 'в') keysRef.current.right = true;

    if (key === ' ') {
      if (viewStateRef.current === 'ready' || viewStateRef.current === 'finished') {
        void beginMatchFlow();
      } else if (viewStateRef.current === 'paused') {
        void resumeMatch();
      }
    }

    if (key === 'escape' && gameModeOpenRef.current) {
      void closeGameMode();
    }
  });

  useEffect(() => {
    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();

      if (key === 'arrowup' || key === 'w' || key === 'ц') keysRef.current.up = false;
      if (key === 'arrowdown' || key === 's' || key === 'ы') keysRef.current.down = false;
      if (key === 'arrowleft' || key === 'a' || key === 'ф') keysRef.current.left = false;
      if (key === 'arrowright' || key === 'd' || key === 'в') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(stepFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [running]);

  function renderArenaSurface(snapshot, { preview = false } = {}) {
    const { player, bot, puck } = snapshot;

    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.18),rgba(2,6,23,0.92)_42%,rgba(2,6,23,1)_100%)]">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/15" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
          <div className="absolute left-0 top-1/2 h-[150px] w-5 -translate-y-1/2 rounded-r-xl border-y border-r border-cyan-300/30 bg-cyan-400/10" />
          <div className="absolute right-0 top-1/2 h-[150px] w-5 -translate-y-1/2 rounded-l-xl border-y border-l border-amber-300/30 bg-amber-400/10" />
          <div className="absolute inset-3 rounded-[22px] border border-white/5" />
        </div>

        <div
          className="absolute rounded-full border border-cyan-200/40 bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.55)]"
          style={{
            width: PLAYER_R * 2,
            height: PLAYER_R * 2,
            left: `${(player.x / ARENA_W) * 100}%`,
            top: `${(player.y / ARENA_H) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex h-full items-center justify-center text-xs font-black uppercase text-slate-950">
            Ты
          </div>
        </div>

        <div
          className="absolute rounded-full border border-amber-200/40 bg-amber-400 shadow-[0_0_40px_rgba(250,204,21,0.45)]"
          style={{
            width: PLAYER_R * 2,
            height: PLAYER_R * 2,
            left: `${(bot.x / ARENA_W) * 100}%`,
            top: `${(bot.y / ARENA_H) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex h-full items-center justify-center text-xs font-black uppercase text-black">
            BOT
          </div>
        </div>

        <div
          className="absolute rounded-full border border-white/40 bg-white shadow-[0_0_18px_rgba(255,255,255,0.55)]"
          style={{
            width: PUCK_R * 2,
            height: PUCK_R * 2,
            left: `${(puck.x / ARENA_W) * 100}%`,
            top: `${(puck.y / ARENA_H) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-black text-cyan-200 backdrop-blur-sm">
          GORILLA
        </div>
        <div className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm font-black text-amber-200 backdrop-blur-sm">
          BOT
        </div>

        {!preview && goalPopup ? (
          <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-4">
            <div
              key={goalPopup.id}
              className={`gorilla-goal-burst rounded-[1.4rem] border px-4 py-3 text-center shadow-[0_16px_44px_rgba(0,0,0,0.28)] ${
                goalPopup.tone === 'accent'
                  ? 'border-amber-300/24 bg-[rgba(245,158,11,0.16)]'
                  : goalPopup.tone === 'success'
                    ? 'border-emerald-300/24 bg-[rgba(16,185,129,0.14)]'
                    : 'border-white/12 bg-black/42'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.16em] text-white">
                {goalPopup.title}
              </p>
              <p className="mt-1 text-sm text-white/74">{goalPopup.detail}</p>
            </div>
          </div>
        ) : null}

        {!preview && pointsFlyKey > 0 ? (
          <div
            key={pointsFlyKey}
            className="gorilla-points-fly pointer-events-none absolute bottom-[5.25rem] left-[46%] rounded-full border border-amber-300/24 bg-[rgba(245,158,11,0.16)] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-200"
          >
            +1 GP
          </div>
        ) : null}

        {preview ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,16,0.18),rgba(5,10,16,0.82))]">
            <div className="flex h-full flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-black/34 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/74">
                  fullscreen play mode
                </span>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                  {pointsLabel}
                </span>
              </div>
              <div className="max-w-md space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
                  Gorilla Mini Match
                </p>
                <p className="text-3xl font-black uppercase tracking-[-0.05em] text-white">
                  Матч открывается только на весь экран
                </p>
                <p className="text-sm leading-7 text-white/72">
                  Нажмите старт, и мы переведём игру в отдельный игровой режим без интерфейса страницы.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderCenterOverlay() {
    if (needsRotateHint) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.24),rgba(5,10,16,0.88))] p-5">
          <div className="max-w-sm rounded-[1.9rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
              Landscape mode
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-white">
              Поверните устройство
            </p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Для мобильного матча нужен горизонтальный режим. После поворота стартовый экран появится автоматически.
            </p>
          </div>
        </div>
      );
    }

    if (viewState === 'ready') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.16),rgba(5,10,16,0.78))] p-5">
          <div className="max-w-sm rounded-[1.9rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
              Gorilla Mini Match
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-white">
              Забей больше шайб за 60 секунд
            </p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Каждый гол приносит +1 Gorilla Point. Счёт, время и баланс уже в HUD.
            </p>
            <button
              type="button"
              onClick={() => void beginMatchFlow()}
              className="mt-5 inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              Старт
            </button>
          </div>
        </div>
      );
    }

    if (viewState === 'paused') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.18),rgba(5,10,16,0.82))] p-5">
          <div className="max-w-sm rounded-[1.9rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
              Пауза
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-white">
              Матч остановлен
            </p>
            <p className="mt-3 text-sm leading-7 text-white/72">{message}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void resumeMatch()}
                className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                Продолжить
              </button>
              <button
                type="button"
                onClick={() => void closeGameMode()}
                className="inline-flex rounded-full border border-white/12 bg-white/6 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (viewState === 'finished') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.22),rgba(5,10,16,0.86))] p-5">
          <div className="max-w-sm rounded-[1.9rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
              Итог матча
            </p>
            <p className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white">
              {score.user}:{score.bot}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/72">{message}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void beginMatchFlow()}
                className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                Новый матч
              </button>
              {!isAuthenticated ? (
                <Link
                  href="/dev/login?next=/cabinet"
                  className="inline-flex rounded-full border border-white/12 bg-white/6 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                >
                  Войти и копить
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <div id="gorilla-mini-game" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(19,49,78,0.92),rgba(6,14,22,0.98)_48%,rgba(3,7,12,1)_100%)] p-4 shadow-[0_24px_80px_rgba(8,12,16,0.34)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/52">
                Gorilla Mini Match
              </p>
              <p className="mt-2 text-2xl font-black uppercase tracking-[-0.05em] text-white">
                Игровой режим открывается на весь экран
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70">
                счёт: {score.user}:{score.bot}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70">
                время: {timeLeft}с
              </span>
              <span className="rounded-full border border-amber-300/18 bg-amber-400/10 px-4 py-2 text-amber-200">
                {pointsLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-black/26 p-3 sm:p-4">
            <div className="aspect-[900/520] w-full">
              {renderArenaSurface(arenaSnapshot, { preview: true })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void openGameMode()}
              className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              Старт матча
            </button>
            <button
              type="button"
              onClick={() => resetMatch(getDefaultMessage(isAuthenticated))}
              className="inline-flex rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
            >
              Сбросить
            </button>
            <p className="text-sm text-white/62">
              После старта откроем отдельный игровой режим. Desktop: клавиатура. Mobile: fullscreen + landscape + virtual stick.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-black/34 p-5 shadow-[0_18px_48px_rgba(8,12,16,0.26)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Статус матча
            </p>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{message}</p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              {authStatus === 'loading'
                ? 'Проверяем вход, чтобы корректно связать матч и Gorilla Points.'
                : gameModeOpen
                ? isBrowserFullscreen
                  ? 'Матч открыт в системном fullscreen-режиме.'
                  : 'Матч открыт в игровом fullscreen-режиме поверх страницы.'
                : 'Матч не стартует внутри embed-блока. Основная игра открывается только в fullscreen play mode.'}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/34 p-5 shadow-[0_18px_48px_rgba(8,12,16,0.26)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Gorilla Points
            </p>
            <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
              {visiblePointsBalance} GP
            </p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              {nextReward
                ? `Следующая фиксированная награда откроется на ${nextReward.cost} GP.`
                : 'Базовые награды уже открыты. Дальше — обмен через кабинет или Telegram школы.'}
            </p>
            {nextReward ? (
              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm font-black text-white">{nextReward.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{nextReward.perk}</p>
              </div>
            ) : null}
            {unlockedRewards.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {unlockedRewards.slice(-2).map((reward) => (
                  <span
                    key={reward.id}
                    className="rounded-full border border-amber-300/24 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200"
                  >
                    {reward.title}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/34 p-5 shadow-[0_18px_48px_rgba(8,12,16,0.26)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Игровой flow
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
              <p>Старт на странице только открывает игровой fullscreen-режим.</p>
              <p>Матч реально начинается уже внутри полноэкранного overlay/HUD.</p>
              <p>На mobile нужен landscape. В portrait покажем rotate hint и не дадим стартовать поломанной сцене.</p>
            </div>
            {!isAuthenticated ? (
              <Link
                href="/dev/login?next=/cabinet"
                className="mt-5 inline-flex rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                Войти и копить баллы
              </Link>
            ) : (
              <Link
                href="/cabinet"
                className="mt-5 inline-flex rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                Открыть кабинет
              </Link>
            )}
          </div>
        </div>
      </div>

      {gameModeOpen ? (
        <div className="fixed inset-0 z-[120] bg-[linear-gradient(180deg,rgba(2,6,12,0.98),rgba(3,8,14,1))] p-2 sm:p-3">
          <div
            ref={overlayRef}
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(20,50,78,0.88),rgba(3,7,12,0.96)_48%,rgba(2,5,10,1))] shadow-[0_24px_80px_rgba(0,0,0,0.44)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54 sm:text-[11px]">
                  Gorilla Mini Match
                </p>
                <p className="mt-1 truncate text-lg font-black uppercase tracking-[-0.04em] text-white sm:text-xl">
                  {score.user}:{score.bot} • {timeLeft}с
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-amber-300/18 bg-amber-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200 sm:px-4">
                  {pointsLabel}
                </span>

                {viewState === 'playing' ? (
                  <button
                    type="button"
                    onClick={() => pauseMatch('Пауза. Вернитесь в матч, когда будете готовы.')}
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:px-4"
                  >
                    Пауза
                  </button>
                ) : viewState === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => void resumeMatch()}
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:px-4"
                  >
                    Продолжить
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => void closeGameMode()}
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:px-4"
                >
                  Выход
                </button>
              </div>
            </div>

            {fullscreenNotice ? (
              <div className="border-b border-white/8 bg-white/[0.03] px-3 py-2 text-center text-[11px] font-medium text-white/62 sm:px-5">
                {fullscreenNotice}
              </div>
            ) : null}

            <div className="relative min-h-0 flex-1">
              <div className="flex h-full items-center justify-center p-2 sm:p-4">
                <div className="aspect-[900/520] h-full max-h-full w-auto max-w-full">
                  {renderArenaSurface(arenaSnapshot)}
                </div>
              </div>

              {renderCenterOverlay()}

              {!needsRotateHint ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-5">
                  {isMobileViewport ? (
                    <VirtualJoystick
                      onAxisChange={(axis) => {
                        axisRef.current = axis;
                      }}
                    />
                  ) : (
                    <div className="pointer-events-none rounded-full border border-white/10 bg-black/32 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
                      WASD / стрелки
                    </div>
                  )}

                  <div className="pointer-events-auto max-w-[18rem] rounded-[1.2rem] border border-white/10 bg-black/34 px-4 py-3 text-right backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gh-accent)]">
                      Gorilla Points
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/68">
                      {isAuthenticated
                        ? nextReward
                          ? `До следующей награды осталось ${Math.max(nextReward.cost - pointsBalance, 0)} GP.`
                          : 'Все базовые награды уже открыты.'
                        : 'Гостевой режим считает голы, но не сохраняет их в аккаунт.'}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
