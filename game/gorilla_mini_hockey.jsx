'use client';

import { useEffect, useRef, useState } from 'react';

import { useGorillaAccount } from '@/components/gorilla-account-provider';

const ARENA_W = 900;
const ARENA_H = 520;
const PLAYER_R = 26;
const PUCK_R = 14;
const GOAL_H = 150;
const GAME_TIME = 60;
const STUCK_TIME_MS = 2000;
const STUCK_MOVEMENT_EPSILON = 0.35;
const CORNER_MARGIN = 72;
const STUCK_COOLDOWN_MS = 2800;
const PUCK_NUDGE_FORCE = 480;
const BOT_UNSTUCK_NUDGE_FORCE = 260;
const BOT_UNSTUCK_NUDGE_DISTANCE = 10;
const emptyKeys = { up: false, down: false, left: false, right: false };
const emptyAxis = { x: 0, y: 0 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function length(x, y) {
  return Math.sqrt(x * x + y * y);
}

function isNearRinkEdge(body) {
  return (
    body.x <= CORNER_MARGIN ||
    body.x >= ARENA_W - CORNER_MARGIN ||
    body.y <= CORNER_MARGIN ||
    body.y >= ARENA_H - CORNER_MARGIN
  );
}

function getVectorToCenter(body) {
  const dx = ARENA_W / 2 - body.x;
  const dy = ARENA_H / 2 - body.y;
  const dist = Math.max(length(dx, dy), 0.001);

  return {
    x: dx / dist,
    y: dy / dist,
  };
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
    ? 'Матч готов. Каждый гол дает +1 Gorilla Point.'
    : 'Гостевой режим считает голы в этой сессии. Войдите, чтобы сохранять Gorilla Points.';
}

function getFinishedMessage(score, isAuthenticated) {
  if (score.user > score.bot) {
    return isAuthenticated
      ? 'Победа. Баллы за голы уже в аккаунте.'
      : 'Победа. Войдите, чтобы сохранять Gorilla Points в следующих матчах.';
  }

  if (score.user === score.bot) {
    return isAuthenticated
      ? 'Ничья. Баллы за голы сохранены.'
      : 'Ничья. Голы засчитаны в гостевой сессии.';
  }

  return 'Матч завершен. Сыграйте еще, чтобы добрать Gorilla Points.';
}

function getResetPuck(withKickoff) {
  const direction = Math.random() > 0.5 ? 1 : -1;

  return {
    x: ARENA_W / 2,
    y: ARENA_H / 2 + (Math.random() * 80 - 40),
    vx: withKickoff ? 240 * direction : 0,
    vy: withKickoff ? Math.random() * 140 - 70 : 0,
  };
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
        className="relative h-28 w-28 touch-none select-none rounded-full border border-white/12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),rgba(0,0,0,0.34))] shadow-[0_20px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-36 sm:w-36"
      >
        <div className="absolute inset-4 rounded-full border border-white/8" />
        <div className="absolute left-1/2 top-1/2 h-px w-[74%] -translate-x-1/2 -translate-y-1/2 bg-white/8" />
        <div className="absolute left-1/2 top-1/2 h-[74%] w-px -translate-x-1/2 -translate-y-1/2 bg-white/8" />
        <div
          className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/44 bg-[color:var(--gh-accent)] shadow-[0_14px_34px_rgba(245,158,11,0.32)] transition sm:h-16 sm:w-16 ${thumb.active ? 'scale-105' : ''}`}
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
    isAuthenticated,
    pointsBalance,
    guestPreviewPoints,
    awardGoalPoint,
  } = useGorillaAccount();

  const [gameModeOpen, setGameModeOpen] = useState(false);
  const [scrollMinimized, setScrollMinimized] = useState(false);
  const [running, setRunning] = useState(false);
  const [viewState, setViewState] = useState('ready');
  const [score, setScore] = useState({ user: 0, bot: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [message, setMessage] = useState(getDefaultMessage(isAuthenticated));
  const [goalPopup, setGoalPopup] = useState(null);
  const [pointsFlyKey, setPointsFlyKey] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isLandscapeViewport, setIsLandscapeViewport] = useState(true);
  const [arenaSnapshot, setArenaSnapshot] = useState({
    player: { x: 150, y: ARENA_H / 2 },
    bot: { x: ARENA_W - 150, y: ARENA_H / 2 },
    puck: { x: ARENA_W / 2, y: ARENA_H / 2 },
  });

  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const countdownRef = useRef(0);
  const keysRef = useRef({ ...emptyKeys });
  const axisRef = useRef({ ...emptyAxis });
  const scoreRef = useRef(score);
  const runningRef = useRef(running);
  const viewStateRef = useRef(viewState);
  const gameModeOpenRef = useRef(gameModeOpen);
  const isMobileViewportRef = useRef(isMobileViewport);
  const isLandscapeViewportRef = useRef(isLandscapeViewport);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const goalPopupIdRef = useRef(0);

  const playerRef = useRef({ x: 150, y: ARENA_H / 2, vx: 0, vy: 0 });
  const botRef = useRef({ x: ARENA_W - 150, y: ARENA_H / 2, vx: 0, vy: 0 });
  const puckRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0 });
  const botStuckRef = useRef({
    lastX: ARENA_W - 150,
    lastY: ARENA_H / 2,
    stillMs: 0,
    cooldownMs: 0,
  });

  const pointsLabel = isAuthenticated ? `${pointsBalance} GP` : `${guestPreviewPoints} GP`;
  const needsRotateHint = gameModeOpen && isMobileViewport && !isLandscapeViewport;
  const hasProgress = viewState !== 'ready' || score.user > 0 || score.bot > 0 || timeLeft < GAME_TIME;

  function syncArenaSnapshot() {
    setArenaSnapshot({
      player: { x: playerRef.current.x, y: playerRef.current.y },
      bot: { x: botRef.current.x, y: botRef.current.y },
      puck: { x: puckRef.current.x, y: puckRef.current.y },
    });
  }

  function resetBodies(withKickoff = true) {
    playerRef.current = { x: 150, y: ARENA_H / 2, vx: 0, vy: 0 };
    botRef.current = { x: ARENA_W - 150, y: ARENA_H / 2, vx: 0, vy: 0 };

    puckRef.current = getResetPuck(withKickoff);
    botStuckRef.current = {
      lastX: botRef.current.x,
      lastY: botRef.current.y,
      stillMs: 0,
      cooldownMs: 0,
    };
  }

  function resetMatch(nextMessage = getDefaultMessage(isAuthenticated)) {
    setRunning(false);
    setViewState('ready');
    setScore({ user: 0, bot: 0 });
    setTimeLeft(GAME_TIME);
    setMessage(nextMessage);
    setGoalPopup(null);
    countdownRef.current = 0;
    lastTsRef.current = null;
    keysRef.current = { ...emptyKeys };
    axisRef.current = { ...emptyAxis };
    scoreRef.current = { user: 0, bot: 0 };
    resetBodies(false);
    syncArenaSnapshot();
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
    setMessage('Матч начался.');
  }

  function closeGameMode(reason = 'Матч на паузе. Нажмите продолжить, чтобы вернуться.') {
    setGameModeOpen(false);
    setScrollMinimized(true);

    if (runningRef.current) {
      pauseMatch(reason);
    }

    unlockLandscapeOrientation();
  }

  function openGameMode() {
    setScrollMinimized(false);
    setGameModeOpen(true);
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
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

    await tryLockLandscapeOrientation();
    setRunning(true);
    setViewState('playing');
    setMessage('Матч продолжается.');
  }

  function handleGoalFeedback(title, detail, tone) {
    goalPopupIdRef.current += 1;
    setGoalPopup({ id: goalPopupIdRef.current, title, detail, tone });
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

  function releaseStuckBotAndPuck(dt) {
    const bot = botRef.current;
    const puck = puckRef.current;
    const stuck = botStuckRef.current;
    const elapsedMs = dt * 1000;
    const botMove = length(bot.x - stuck.lastX, bot.y - stuck.lastY);

    stuck.cooldownMs = Math.max(0, stuck.cooldownMs - elapsedMs);

    if (botMove <= STUCK_MOVEMENT_EPSILON) {
      stuck.stillMs += elapsedMs;
    } else {
      stuck.stillMs = 0;
    }

    stuck.lastX = bot.x;
    stuck.lastY = bot.y;

    const puckDistance = length(puck.x - bot.x, puck.y - bot.y);
    const puckIsPinned = isNearRinkEdge(puck);
    const botIsPinned = isNearRinkEdge(bot);
    const isStuck =
      stuck.cooldownMs <= 0 &&
      stuck.stillMs >= STUCK_TIME_MS &&
      puckDistance <= PLAYER_R + PUCK_R + 18 &&
      (puckIsPinned || botIsPinned);

    if (!isStuck) {
      return;
    }

    // Keeps the AI from pinning the puck forever at the boards without resetting the match.
    const puckCenterVector = getVectorToCenter(puck);
    const botCenterVector = getVectorToCenter(bot);

    puck.vx += puckCenterVector.x * PUCK_NUDGE_FORCE;
    puck.vy += puckCenterVector.y * PUCK_NUDGE_FORCE;
    bot.vx += botCenterVector.x * BOT_UNSTUCK_NUDGE_FORCE;
    bot.vy += botCenterVector.y * BOT_UNSTUCK_NUDGE_FORCE;
    bot.x = clamp(
      bot.x + botCenterVector.x * BOT_UNSTUCK_NUDGE_DISTANCE,
      ARENA_W / 2 + PLAYER_R + 18,
      ARENA_W - PLAYER_R - 10
    );
    bot.y = clamp(
      bot.y + botCenterVector.y * BOT_UNSTUCK_NUDGE_DISTANCE,
      PLAYER_R + 10,
      ARENA_H - PLAYER_R - 10
    );

    stuck.stillMs = 0;
    stuck.cooldownMs = STUCK_COOLDOWN_MS;
    stuck.lastX = bot.x;
    stuck.lastY = bot.y;
  }

  function scoreGoal(side) {
    if (side === 'user') {
      const awardResult = awardGoalPoint();
      const nextScore = { ...scoreRef.current, user: scoreRef.current.user + 1 };

      setScore(nextScore);
      scoreRef.current = nextScore;
      setPointsFlyKey((value) => value + 1);

      if (awardResult.savedToAccount) {
        const detail =
          awardResult.unlockedRewards.length > 0
            ? awardResult.unlockedRewards[0].title
            : `Баланс: ${awardResult.nextBalance} GP`;

        setMessage('+1 GP за гол.');
        handleGoalFeedback('+1 Gorilla Point', detail, awardResult.unlockedRewards.length > 0 ? 'accent' : 'success');
      } else {
        setMessage('+1 GP в гостевой сессии.');
        handleGoalFeedback('+1 в сессии', 'Войдите, чтобы сохранить баллы', 'default');
      }
    } else {
      const nextScore = { ...scoreRef.current, bot: scoreRef.current.bot + 1 };

      setScore(nextScore);
      scoreRef.current = nextScore;
      setMessage('Соперник забил.');
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

    const botSpeed = length(bot.vx, bot.vy);
    if (botSpeed > 360) {
      bot.vx = (bot.vx / botSpeed) * 360;
      bot.vy = (bot.vy / botSpeed) * 360;
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

    if (dist < PLAYER_R * 2 && dist > 0) {
      const overlap = (PLAYER_R * 2 - dist) / 2;
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

    releaseStuckBotAndPuck(dt);
  }

  function stepFrame(timestamp) {
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
    rafRef.current = requestAnimationFrame(stepFrame);
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
    isMobileViewportRef.current = isMobileViewport;
  }, [isMobileViewport]);

  useEffect(() => {
    isLandscapeViewportRef.current = isLandscapeViewport;
  }, [isLandscapeViewport]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    setMessage((current) => (viewStateRef.current === 'ready' ? getDefaultMessage(isAuthenticated) : current));
  }, [isAuthenticated]);

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
    const handleScrollState = () => {
      if (!sectionRef.current) {
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const inFocus = rect.top <= viewportHeight * 0.22 && rect.bottom >= viewportHeight * 0.62;
      const outside = rect.bottom < viewportHeight * 0.2 || rect.top > viewportHeight * 0.82;

      if (gameModeOpenRef.current && outside) {
        closeGameMode('Матч свернут при прокрутке. Прогресс сохранен.');
        return;
      }

      if (!gameModeOpenRef.current && !scrollMinimized && inFocus) {
        setGameModeOpen(true);
      }
    };

    handleScrollState();
    window.addEventListener('scroll', handleScrollState, { passive: true });
    window.addEventListener('resize', handleScrollState);

    return () => {
      window.removeEventListener('scroll', handleScrollState);
      window.removeEventListener('resize', handleScrollState);
    };
  }, [scrollMinimized]);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
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

      if (key === 'escape') {
        closeGameMode();
      }
    };

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
      <div className="relative h-full w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.18),rgba(2,6,23,0.92)_42%,rgba(2,6,23,1)_100%)] sm:rounded-[1.7rem]">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/15" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:h-40 sm:w-40" />
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
            Вы
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

        {!preview && goalPopup ? (
          <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center px-4">
            <div
              key={goalPopup.id}
              className={`gorilla-goal-burst rounded-[1.2rem] border px-4 py-3 text-center shadow-[0_16px_44px_rgba(0,0,0,0.28)] ${
                goalPopup.tone === 'accent'
                  ? 'border-amber-300/24 bg-[rgba(245,158,11,0.16)]'
                  : goalPopup.tone === 'success'
                    ? 'border-emerald-300/24 bg-[rgba(16,185,129,0.14)]'
                    : 'border-white/12 bg-black/42'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm">
                {goalPopup.title}
              </p>
              <p className="mt-1 text-xs text-white/74 sm:text-sm">{goalPopup.detail}</p>
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
      </div>
    );
  }

  function renderCenterOverlay() {
    if (needsRotateHint) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.24),rgba(5,10,16,0.88))] p-5">
          <div className="max-w-sm rounded-[1.2rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
              Landscape
            </p>
            <p className="mt-3 text-2xl font-black uppercase text-white">
              Поверните устройство
            </p>
          </div>
        </div>
      );
    }

    if (viewState === 'ready') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.12),rgba(5,10,16,0.72))] p-5">
          <div className="max-w-sm rounded-[1.2rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
              Gorilla Mini Match
            </p>
            <p className="mt-3 text-2xl font-black uppercase text-white">
              60 секунд на голы
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
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.14),rgba(5,10,16,0.78))] p-5">
          <div className="max-w-sm rounded-[1.2rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
              Пауза
            </p>
            <p className="mt-3 text-2xl font-black uppercase text-white">
              {score.user}:{score.bot}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/72">{message}</p>
            <button
              type="button"
              onClick={() => void resumeMatch()}
              className="mt-5 inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              Продолжить
            </button>
          </div>
        </div>
      );
    }

    if (viewState === 'finished') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(5,10,16,0.2),rgba(5,10,16,0.84))] p-5">
          <div className="max-w-sm rounded-[1.2rem] border border-white/10 bg-black/48 p-6 text-center backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
              Итог
            </p>
            <p className="mt-3 text-4xl font-black uppercase text-white">
              {score.user}:{score.bot}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/72">{message}</p>
            <button
              type="button"
              onClick={() => void beginMatchFlow()}
              className="mt-5 inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              Новый матч
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  function renderCompactPreview() {
    return (
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-[1180px] items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-5 rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(19,49,78,0.92),rgba(6,14,22,0.98)_52%,rgba(3,7,12,1)_100%)] p-4 shadow-[0_24px_80px_rgba(8,12,16,0.34)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div className="aspect-[900/520] min-h-0 w-full">
            {renderArenaSurface(arenaSnapshot, { preview: true })}
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
                Gorilla Mini Match
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-none text-white sm:text-4xl">
                {hasProgress ? 'Матч на паузе' : 'Игровой блок'}
              </h2>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase tracking-[0.14em] text-white/78">
                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  {score.user}:{score.bot}
                </span>
                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  {timeLeft}с
                </span>
                <span className="rounded-xl border border-amber-300/18 bg-amber-400/10 px-3 py-3 text-amber-200">
                  {pointsLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openGameMode}
                className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                {hasProgress ? 'Продолжить' : 'Играть'}
              </button>
              {hasProgress ? (
                <button
                  type="button"
                  onClick={() => resetMatch(getDefaultMessage(isAuthenticated))}
                  className="inline-flex rounded-full border border-white/12 bg-white/6 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                >
                  Сброс
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="gorilla-mini-game"
      ref={sectionRef}
      className={`relative ${gameModeOpen ? 'min-h-[175dvh]' : 'min-h-[70dvh]'}`}
    >
      {gameModeOpen ? (
        <div className="sticky top-0 z-30 flex h-[100dvh] w-full items-stretch overflow-hidden bg-[linear-gradient(180deg,rgba(2,6,12,0.98),rgba(3,8,14,1))] p-2 sm:p-3">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(20,50,78,0.88),rgba(3,7,12,0.96)_48%,rgba(2,5,10,1))] shadow-[0_24px_80px_rgba(0,0,0,0.44)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
              <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                <span className="rounded-full border border-white/10 bg-black/42 px-3 py-2 backdrop-blur-sm">
                  {score.user}:{score.bot}
                </span>
                <span className="rounded-full border border-white/10 bg-black/42 px-3 py-2 backdrop-blur-sm">
                  {timeLeft}с
                </span>
                <span className="rounded-full border border-amber-300/18 bg-amber-400/10 px-3 py-2 text-amber-200 backdrop-blur-sm">
                  {pointsLabel}
                </span>
              </div>

              <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
                {viewState === 'playing' ? (
                  <button
                    type="button"
                    onClick={() => pauseMatch('Пауза. Вернитесь, когда будете готовы.')}
                    className="rounded-full border border-white/12 bg-black/42 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                  >
                    Пауза
                  </button>
                ) : viewState === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => void resumeMatch()}
                    className="rounded-full border border-white/12 bg-black/42 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                  >
                    Продолжить
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => closeGameMode()}
                  className="rounded-full border border-white/12 bg-black/42 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                >
                  Выйти
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              <div className="flex h-full items-center justify-center p-2 pt-16 sm:p-5 sm:pt-16">
                <div className="aspect-[900/520] h-auto max-h-full w-full max-w-[min(100%,150vh)]">
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        renderCompactPreview()
      )}
    </div>
  );
}
