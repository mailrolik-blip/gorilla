'use client';

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

import {
  GORILLA_POINTS_REWARDS,
  getNewlyUnlockedGorillaRewards,
  getNextGorillaReward,
  getUnlockedGorillaRewards,
  type GorillaReward,
} from '@/lib/gorilla-points';

type AccountAuthStatus = 'loading' | 'guest' | 'authenticated';

type GorillaAccountUser = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  staffRole: string | null;
  roles: string[];
  preferredCity: {
    id: number;
    name: string;
  } | null;
  profile: {
    id: number;
    profileType: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export type GorillaAccountNotification = {
  id: string;
  title: string;
  description: string;
  href?: string;
  createdAt: string;
  unread: boolean;
  tone: 'default' | 'accent' | 'success';
  kind: 'system' | 'points' | 'reward' | 'news' | 'booking';
};

type PersistedAccountState = {
  pointsBalance: number;
  notifications: GorillaAccountNotification[];
  seenNewsIds: string[];
};

type GoalPointAwardResult = {
  savedToAccount: boolean;
  nextBalance: number;
  unlockedRewards: GorillaReward[];
};

type GorillaAccountContextValue = {
  authStatus: AccountAuthStatus;
  isAuthenticated: boolean;
  currentUser: GorillaAccountUser | null;
  pointsBalance: number;
  guestPreviewPoints: number;
  notifications: GorillaAccountNotification[];
  unreadCount: number;
  rewardsCatalog: typeof GORILLA_POINTS_REWARDS;
  unlockedRewards: GorillaReward[];
  nextReward: GorillaReward | null;
  awardGoalPoint: () => GoalPointAwardResult;
  announceNews: (news: { id: string; title: string; href: string }) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearGuestPreviewPoints: () => void;
};

const GorillaAccountContext = createContext<GorillaAccountContextValue | null>(null);

const STORAGE_VERSION = 'v1';

function createNotificationId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAccountStorageKey(userId: number) {
  return `gorilla-account:${STORAGE_VERSION}:${userId}`;
}

function createDefaultNotifications(): GorillaAccountNotification[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'welcome-account',
      title: 'Кабинет подключён',
      description: 'Баллы за голы будут сохраняться автоматически после каждого матча.',
      href: '/cabinet',
      createdAt: now,
      unread: true,
      tone: 'default',
      kind: 'system',
    },
    {
      id: 'welcome-points',
      title: 'Gorilla Points активны',
      description: '100 баллов открывают первую фиксированную награду без розыгрышей и случайных призов.',
      href: '/#discount-game',
      createdAt: now,
      unread: true,
      tone: 'accent',
      kind: 'reward',
    },
  ];
}

function readPersistedAccountState(userId: number): PersistedAccountState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getAccountStorageKey(userId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<PersistedAccountState>;

    return {
      pointsBalance:
        typeof parsedValue.pointsBalance === 'number' ? parsedValue.pointsBalance : 0,
      notifications: Array.isArray(parsedValue.notifications)
        ? parsedValue.notifications.filter(Boolean) as GorillaAccountNotification[]
        : createDefaultNotifications(),
      seenNewsIds: Array.isArray(parsedValue.seenNewsIds)
        ? parsedValue.seenNewsIds.filter((item): item is string => typeof item === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

function appendNotifications(
  existingNotifications: GorillaAccountNotification[],
  incomingNotifications: GorillaAccountNotification[]
) {
  return [...incomingNotifications, ...existingNotifications].slice(0, 12);
}

export function GorillaAccountProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AccountAuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<GorillaAccountUser | null>(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [guestPreviewPoints, setGuestPreviewPoints] = useState(0);
  const [notifications, setNotifications] = useState<GorillaAccountNotification[]>([]);
  const [seenNewsIds, setSeenNewsIds] = useState<string[]>([]);

  const pointsBalanceRef = useRef(0);
  const guestPreviewPointsRef = useRef(0);
  const notificationsRef = useRef<GorillaAccountNotification[]>([]);
  const seenNewsIdsRef = useRef<string[]>([]);
  const currentUserRef = useRef<GorillaAccountUser | null>(null);

  useEffect(() => {
    pointsBalanceRef.current = pointsBalance;
  }, [pointsBalance]);

  useEffect(() => {
    guestPreviewPointsRef.current = guestPreviewPoints;
  }, [guestPreviewPoints]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    seenNewsIdsRef.current = seenNewsIds;
  }, [seenNewsIds]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
        });

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setCurrentUser(null);
          setPointsBalance(0);
          setNotifications([]);
          setSeenNewsIds([]);
          setGuestPreviewPoints(0);
          setAuthStatus('guest');
          return;
        }

        if (!response.ok) {
          setCurrentUser(null);
          setPointsBalance(0);
          setNotifications([]);
          setSeenNewsIds([]);
          setGuestPreviewPoints(0);
          setAuthStatus('guest');
          return;
        }

        const payload = (await response.json()) as GorillaAccountUser;
        const persistedState = readPersistedAccountState(payload.id);

        setCurrentUser(payload);
        setPointsBalance(persistedState?.pointsBalance ?? 0);
        setNotifications(persistedState?.notifications ?? createDefaultNotifications());
        setSeenNewsIds(persistedState?.seenNewsIds ?? []);
        setGuestPreviewPoints(0);
        setAuthStatus('authenticated');
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
          setPointsBalance(0);
          setNotifications([]);
          setSeenNewsIds([]);
          setGuestPreviewPoints(0);
          setAuthStatus('guest');
        }
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !currentUser || typeof window === 'undefined') {
      return;
    }

    const payload: PersistedAccountState = {
      pointsBalance,
      notifications,
      seenNewsIds,
    };

    window.localStorage.setItem(getAccountStorageKey(currentUser.id), JSON.stringify(payload));
  }, [authStatus, currentUser, notifications, pointsBalance, seenNewsIds]);

  function awardGoalPoint(): GoalPointAwardResult {
    if (authStatus !== 'authenticated' || !currentUserRef.current) {
      const nextBalance = guestPreviewPointsRef.current + 1;
      setGuestPreviewPoints(nextBalance);

      return {
        savedToAccount: false,
        nextBalance,
        unlockedRewards: [],
      };
    }

    const previousBalance = pointsBalanceRef.current;
    const nextBalance = previousBalance + 1;
    const unlockedRewards = getNewlyUnlockedGorillaRewards(previousBalance, nextBalance);

    setPointsBalance(nextBalance);

    const nextNotifications: GorillaAccountNotification[] = [
      {
        id: createNotificationId('goal-point'),
        title: 'Начислен 1 Gorilla Point',
        description:
          unlockedRewards.length > 0
            ? `Баланс: ${nextBalance} GP. Доступна новая награда.`
            : `Баланс: ${nextBalance} GP.`,
        href: unlockedRewards.length > 0 ? '/cabinet' : '/#discount-game',
        createdAt: new Date().toISOString(),
        unread: true,
        tone: unlockedRewards.length > 0 ? 'accent' : 'success',
        kind: 'points',
      },
    ];

    if (unlockedRewards.length > 0) {
      nextNotifications.unshift({
        id: createNotificationId('reward-ready'),
        title: 'Доступна награда за Gorilla Points',
        description: unlockedRewards.map((reward) => reward.title).join(' • '),
        href: '/cabinet',
        createdAt: new Date().toISOString(),
        unread: true,
        tone: 'accent',
        kind: 'reward',
      });
    }

    setNotifications((currentNotifications) =>
      appendNotifications(currentNotifications, nextNotifications)
    );

    return {
      savedToAccount: true,
      nextBalance,
      unlockedRewards,
    };
  }

  function announceNews(news: { id: string; title: string; href: string }) {
    if (authStatus !== 'authenticated' || !currentUserRef.current) {
      return;
    }

    if (seenNewsIdsRef.current.includes(news.id)) {
      return;
    }

    setSeenNewsIds((currentIds) => [...currentIds, news.id]);
    setNotifications((currentNotifications) =>
      appendNotifications(currentNotifications, [
        {
          id: createNotificationId('news'),
          title: 'Новый пост школы',
          description: news.title,
          href: news.href,
          createdAt: new Date().toISOString(),
          unread: true,
          tone: 'default',
          kind: 'news',
        },
      ])
    );
  }

  function markNotificationRead(notificationId: string) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  }

  function markAllNotificationsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.unread
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  }

  function clearGuestPreviewPoints() {
    setGuestPreviewPoints(0);
  }

  const unlockedRewards = getUnlockedGorillaRewards(pointsBalance);
  const nextReward = getNextGorillaReward(pointsBalance);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <GorillaAccountContext.Provider
      value={{
        authStatus,
        isAuthenticated: authStatus === 'authenticated' && currentUser !== null,
        currentUser,
        pointsBalance,
        guestPreviewPoints,
        notifications,
        unreadCount,
        rewardsCatalog: GORILLA_POINTS_REWARDS,
        unlockedRewards,
        nextReward,
        awardGoalPoint,
        announceNews,
        markNotificationRead,
        markAllNotificationsRead,
        clearGuestPreviewPoints,
      }}
    >
      {children}
    </GorillaAccountContext.Provider>
  );
}

export function useGorillaAccount() {
  const context = useContext(GorillaAccountContext);

  if (!context) {
    throw new Error('useGorillaAccount must be used within GorillaAccountProvider');
  }

  return context;
}
