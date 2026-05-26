export type GorillaReward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  perk: string;
};

export const GORILLA_POINTS_STEP = 100;

export const GORILLA_POINTS_REWARDS: GorillaReward[] = [
  {
    id: 'training-discount',
    title: 'Скидка 10% на тренировку',
    description: 'Фиксированная награда для первой персональной или групповой записи.',
    cost: 100,
    perk: '10% на одну тренировку',
  },
  {
    id: 'package-discount',
    title: 'Скидка на пакет занятий',
    description: 'Подходит тем, кто уже вошёл в регулярный тренировочный ритм.',
    cost: 200,
    perk: '15% на пакет из 4 занятий',
  },
  {
    id: 'gorilla-merch',
    title: 'Клубный мерч',
    description: 'Фиксированный бонус для игроков, которые стабильно возвращаются в игру.',
    cost: 300,
    perk: 'Фирменная бейсболка или баф Gorilla Hockey',
  },
  {
    id: 'camp-offer',
    title: 'Спец-предложение на сбор',
    description: 'Персональная скидка на ближайший интенсив или клубный выездной формат.',
    cost: 400,
    perk: 'Спец-цена на сбор или клубную акцию',
  },
];

export function getUnlockedGorillaRewards(pointsBalance: number) {
  return GORILLA_POINTS_REWARDS.filter((reward) => pointsBalance >= reward.cost);
}

export function getNextGorillaReward(pointsBalance: number) {
  return GORILLA_POINTS_REWARDS.find((reward) => pointsBalance < reward.cost) ?? null;
}

export function getNewlyUnlockedGorillaRewards(previousBalance: number, nextBalance: number) {
  return GORILLA_POINTS_REWARDS.filter(
    (reward) => previousBalance < reward.cost && nextBalance >= reward.cost
  );
}
