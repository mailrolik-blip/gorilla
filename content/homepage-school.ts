export type HomepageMenuItem = {
  label: string;
  href: string;
  mobileLabel?: string;
};

export type HomepageHeroCard = {
  eyebrow: string;
  title: string;
  detail: string;
  image: string;
};

export type HomepageNewsSection = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageStatItem = {
  value: string;
  label: string;
  detail: string;
  href: string;
  cta: string;
};

export type HomepageTrainingType = {
  title: string;
  subtitle: string;
  audience: string;
  image: string;
  badges: string[];
  featured?: boolean;
};

export type HomepageGalleryItem = {
  title: string;
  image: string;
};

export type HomepageResultItem = {
  label: string;
  value: string;
};

export type HomepageTeam = {
  city: string;
  teamName: string;
  description: string;
  achievement: string;
  image: string;
  gallery: HomepageGalleryItem[];
  results: HomepageResultItem[];
  ctaHref: string;
  ctaLabel: string;
};

export type HomepageTrainer = {
  name: string;
  role: string;
  experience: string;
  image: string;
  specialization: string[];
  achievements: string[];
};

export type HomepageTestimonial = {
  name: string;
  role: string;
  quote: string;
};

export type HomepageLocation = {
  city: string;
  address: string;
  note: string;
  image: string;
  routeHref: string;
  phoneHref: string;
  schedule: string[];
};

export type HomepageFooterLinkGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export const homepageSchoolContent = {
  site: {
    brand: 'Gorilla Hockey',
    logoSrc: '/homepage-school/gorilla-logo.png',
    logoAlt: 'Логотип Gorilla Hockey',
    phoneLabel: '+7 (910) 130-17-77',
    phoneHref: 'tel:+79101301777',
    telegramLabel: 'Telegram',
    telegramHref: 'https://t.me/Gorillahockeyacademy',
    whatsappLabel: 'WhatsApp',
    whatsappHref: 'https://wa.me/79101301777',
    websiteLabel: 'gorillahockey.ru',
    websiteHref: 'https://gorillahockey.ru',
    loginHref: '/dev/login?next=/cabinet',
    cabinetHref: '/cabinet',
    registerHref: 'https://t.me/Gorillahockeyacademy',
  },
  menu: [
    { label: 'О школе', href: '#hero', mobileLabel: 'Главная' },
    { label: 'Новости', href: '#news', mobileLabel: 'Новости' },
    { label: 'Тренировки', href: '#trainings', mobileLabel: 'Лёд' },
    { label: 'Команды', href: '#teams', mobileLabel: 'Команды' },
    { label: 'Тренеры', href: '#trainers' },
    { label: 'Аренда', href: '#rent' },
    { label: 'Игра', href: '#discount-game', mobileLabel: 'Игра' },
    { label: 'Контакты', href: '#location', mobileLabel: 'Контакты' },
  ] satisfies HomepageMenuItem[],
  news: {
    eyebrow: 'Новости школы',
    title: 'Последние новости Gorilla Hockey Academy',
    description:
      'Показываем свежие посты школы прямо на главной: наборы, результаты матчей, расписание и важные клубные обновления.',
    ctaLabel: 'Читать в Telegram',
    ctaHref: 'https://t.me/Gorillahockeyacademy',
  } satisfies HomepageNewsSection,
  hero: {
    eyebrow: 'Набор в сезон 2026/27',
    title: 'Детская хоккейная школа Gorilla Hockey',
    description:
      'Тренировки на льду, команды ЛХЛ и индивидуальная работа для детей в Москве и Нижнем Новгороде.',
    chips: ['От 5 лет', '2 города', 'Команды-призёры ЛХЛ'],
    primaryCta: { label: 'Стать гориллой', href: '#trainings' },
    secondaryCta: { label: 'Выбрать дату тренировки', href: '/cabinet' },
    tertiaryCta: { label: 'Посмотреть команды', href: '#teams' },
    cards: [
      {
        eyebrow: 'Первый лёд',
        title: 'Спокойный старт',
        detail: 'Катание, баланс и уверенность с первых занятий.',
        image: '/homepage-school/training-kids.svg',
      },
      {
        eyebrow: 'Командный ритм',
        title: 'Матчи и рост',
        detail: 'Путь от тренировок к регулярной игре и просмотрам.',
        image: '/homepage-school/team-moscow.svg',
      },
    ] satisfies HomepageHeroCard[],
    visualStats: [
      { value: '5+', label: 'старт с 5 лет' },
      { value: '2', label: 'города школы' },
      { value: '2', label: 'команды ЛХЛ' },
    ],
    primaryImage: '/homepage-school/hero-ice-arena.svg',
  },
  stats: [
    {
      value: '2',
      label: 'города школы',
      detail: 'Москва и Нижний Новгород работают в одном клубном ритме: тренировки, команды и сборы связаны между собой.',
      href: '#teams',
      cta: 'Открыть команды',
    },
    {
      value: '5',
      label: 'форматов на льду',
      detail: 'Есть первый лёд, семейный формат, группы по возрасту и индивидуальная работа с тренером.',
      href: '#trainings',
      cta: 'Смотреть тренировки',
    },
    {
      value: '2',
      label: 'команды-призёра ЛХЛ',
      detail: 'Обе команды уже брали призы в ЛХЛ и продолжают расти через регулярные матчи и просмотры.',
      href: '#teams',
      cta: 'Смотреть результаты',
    },
    {
      value: '4',
      label: 'сезонных сбора',
      detail: 'Интенсивы помогают добавить объём льда и точечно усилить подготовку в ключевые отрезки сезона.',
      href: '#trainings',
      cta: 'Узнать формат',
    },
    {
      value: '8',
      label: 'клубных активностей',
      detail: 'Челленджи, конкурсы и игровые события поддерживают интерес ребёнка между тренировками и матчами.',
      href: '#discount-game',
      cta: 'Открыть игру',
    },
    {
      value: '+1',
      label: 'Gorilla Point за гол',
      detail: 'Каждая шайба в мини-матче даёт 1 балл. Баллы копятся в аккаунте и открывают фиксированные награды.',
      href: '#discount-game',
      cta: 'Играть и копить',
    },
  ] satisfies HomepageStatItem[],
  trainings: {
    eyebrow: 'Виды тренировок',
    title: 'Выберите свой формат льда',
    description:
      'Для новичков, семейных занятий, группового прогресса и точечной индивидуальной работы.',
    cta: { label: 'Выбрать дату тренировки', href: '/cabinet' },
    items: [
      {
        title: 'Для детей',
        subtitle: 'Первый лёд, базовое катание и уверенность в понятном темпе.',
        audience: 'Старт для начинающих игроков',
        image: '/homepage-school/training-kids.svg',
        badges: ['5-8 лет', 'Первый лёд', 'Техника'],
        featured: true,
      },
      {
        title: 'Дети и родители',
        subtitle: 'Совместный лёд помогает быстрее втянуться в ритм школы и почувствовать поддержку.',
        audience: 'Family ice',
        image: '/homepage-school/training-family.svg',
        badges: ['Вместе на льду', 'Поддержка семьи'],
      },
      {
        title: 'Средняя группа',
        subtitle: 'Катание, шайба и игровые решения, когда база уже собрана.',
        audience: 'Рост темпа и уверенности',
        image: '/homepage-school/training-middle.svg',
        badges: ['U10-U12', 'Игровые связки'],
      },
      {
        title: 'Старшая группа',
        subtitle: 'Скорость, тактика и подготовка к матчевому режиму.',
        audience: 'Высокий темп',
        image: '/homepage-school/training-senior.svg',
        badges: ['U13+', 'Матчевый ритм'],
      },
      {
        title: 'Индивидуальные занятия',
        subtitle: 'Точечная работа над техникой, броском и слабыми местами игрока.',
        audience: 'Персональный маршрут',
        image: '/homepage-school/training-individual.svg',
        badges: ['1 на 1', 'Бросок', 'Техника'],
      },
    ] satisfies HomepageTrainingType[],
  },
  teams: {
    eyebrow: 'Две команды',
    title: 'Москва и Нижний Новгород играют в одном клубном ритме',
    description:
      'Обе команды уже стали призёрами ЛХЛ и продолжают расти через матчи, сборы и регулярную игровую практику.',
    items: [
      {
        city: 'Москва',
        teamName: 'Gorilla Hockey Moscow',
        description:
          'Плотный городской график, регулярный лёд и много игровой практики по ходу сезона.',
        achievement:
          'Призёры ЛХЛ. Команда растёт через просмотры, матчи и постоянную связь с тренерским штабом.',
        image: '/homepage-school/team-moscow.svg',
        gallery: [
          { title: 'Матчевый старт', image: '/homepage-school/gallery-rush.svg' },
          { title: 'Разбор смены', image: '/homepage-school/gallery-bench.svg' },
          { title: 'Финиш атаки', image: '/homepage-school/gallery-shot.svg' },
        ],
        results: [
          { label: 'Последний матч', value: '6:3 vs Stomadent' },
          { label: 'Следующий выход', value: 'Суббота • 18:30' },
          { label: 'Фокус недели', value: 'Темп первого периода' },
        ],
        ctaHref: '/cabinet',
        ctaLabel: 'Записаться на просмотр',
      },
      {
        city: 'Нижний Новгород',
        teamName: 'Gorilla Hockey Nizhny',
        description:
          'Команда растёт через игровой объём, тренерский контакт и выездные сборы.',
        achievement:
          'Призёры ЛХЛ. Здесь много матчевой практики и системной работы над игровыми решениями.',
        image: '/homepage-school/team-nizhny.svg',
        gallery: [
          { title: 'Разгон звена', image: '/homepage-school/gallery-shot.svg' },
          { title: 'Командный круг', image: '/homepage-school/gallery-rush.svg' },
          { title: 'Ритм на лавке', image: '/homepage-school/gallery-bench.svg' },
        ],
        results: [
          { label: 'Последний матч', value: '4:2 в кубковом туре' },
          { label: 'Следующий выход', value: 'Воскресенье • 16:00' },
          { label: 'Фокус недели', value: 'Быстрый выход из зоны' },
        ],
        ctaHref: '/cabinet',
        ctaLabel: 'Узнать о просмотре',
      },
    ] satisfies HomepageTeam[],
  },
  trainers: {
    eyebrow: 'Тренеры',
    title: 'Тренерский штаб Gorilla Hockey',
    description:
      'Четыре направления в одной команде: катание, техника, игровой ритм и индивидуальная доработка.',
    items: [
      {
        name: 'Денис Горюнов',
        role: 'Техника катания и силовой ритм',
        experience: '6 лет тренерского опыта',
        image: '/homepage-school/trainer-placeholder-1.svg',
        specialization: ['Катание', 'Баланс', 'Ведение шайбы'],
        achievements: [
          'Серебряный призёр международного студенческого турнира',
          'Призёр высшей лиги Нижнего Новгорода',
          'Работает над базой, скоростью и устойчивостью игрока',
        ],
      },
      {
        name: 'Роман Кузнецов',
        role: 'Контроль шайбы и игровой рисунок',
        experience: '4 года тренерского опыта',
        image: '/homepage-school/trainer-placeholder-2.svg',
        specialization: ['Контроль шайбы', 'Передача', 'Игровые связки'],
        achievements: [
          'Бронзовый призёр России среди студенческих команд',
          'Серебряный призёр международного студенческого турнира',
          'Фокус на чтении эпизода и темпе принятия решений',
        ],
      },
      {
        name: 'Тренер по броску',
        role: 'Постановка кистевого, щелчка и завершения атаки',
        experience: 'Индивидуальная работа и мини-группы',
        image: '/homepage-school/trainer-placeholder-3.svg',
        specialization: ['Бросок', 'Кистевой', 'Щелчок'],
        achievements: [
          'Точечная работа над техникой рук и корпусом',
          'Отдельные серии занятий под слабые зоны игрока',
          'Подготовка к просмотрам и игровым задачам сезона',
        ],
      },
      {
        name: 'Тренер по игровой подготовке',
        role: 'Скорость решений и подготовка к матчевому режиму',
        experience: 'Сборы, игры и групповая динамика',
        image: '/homepage-school/trainer-placeholder-4.svg',
        specialization: ['Тактика', 'Смена', 'Матчевый ритм'],
        achievements: [
          'Разбор игровых ситуаций и смен',
          'Подготовка к турнирам, сборам и просмотрам',
          'Связка между школьным льдом и командным режимом',
        ],
      },
    ] satisfies HomepageTrainer[],
  },
  iceRent: {
    eyebrow: 'Аренда льда',
    title: 'Лёд для команды, просмотра и частных занятий',
    description:
      'Подберём слот под тренировку, просмотр, индивидуальную работу или семейный формат.',
    image: '/homepage-school/ice-rent.svg',
    primaryCta: { label: 'Забронировать', href: '/cabinet' },
    secondaryCta: { label: 'Узнать условия', href: '#location' },
    details: [
      'Почасовые окна под школу, команду и частные занятия',
      'Помощь с подбором удобного времени и формата льда',
      'Связь с администратором для подтверждения условий',
    ],
  },
  testimonials: {
    eyebrow: 'Отзывы',
    title: 'Что говорят о Gorilla Hockey',
    items: [
      {
        name: 'Ольга',
        role: 'мама игрока U10',
        quote: 'Ребёнок ждёт следующую тренировку и начал увереннее чувствовать себя на льду уже через несколько занятий.',
      },
      {
        name: 'Артём',
        role: 'старшая группа',
        quote: 'Нравится высокий темп и то, что работа на тренировке сразу помогает в игре и на матчах.',
      },
      {
        name: 'Игорь',
        role: 'родитель family ice',
        quote: 'Совместный лёд снимает барьер: ребёнок втягивается быстрее, а школа ощущается живой и открытой.',
      },
      {
        name: 'Марина',
        role: 'семья нового игрока',
        quote: 'На главной сразу понятно, куда идти: тренировки, команды, аренда и контакты собраны в одном месте.',
      },
    ] satisfies HomepageTestimonial[],
  },
  discountGame: {
    eyebrow: 'Gorilla Points',
    title: 'Играйте в мини-матч и копите Gorilla Points',
    description:
      'Каждый гол в мини-хоккее приносит 1 Gorilla Point. Баллы сохраняются в аккаунте и обмениваются на фиксированные награды без розыгрышей и случайных билетов.',
    rewards: [
      '100 GP = скидка 10% на тренировку',
      '200 GP = скидка на пакет занятий',
      '300 GP = клубный мерч',
      '400 GP = спец-предложение на сбор',
    ],
    rules: [
      'Матч длится 60 секунд.',
      'Каждый забитый гол приносит +1 Gorilla Point.',
      'Баллы сохраняются в аккаунте после входа в кабинет.',
      'Награды фиксированные: без лотерей, chance-механик и случайных призов.',
    ],
  },
  locations: {
    eyebrow: 'Где мы находимся',
    title: 'Две ледовые точки школы',
    description:
      'Быстрый переход в маршрут, связь с администратором и короткая памятка по формату занятий.',
    items: [
      {
        city: 'Москва',
        address: 'ЛДС Москва, лёд A',
        note: 'Тренировки школы, просмотры и часть клубного расписания.',
        image: '/homepage-school/map-moscow.svg',
        routeHref: 'https://yandex.ru/maps/?text=%D0%9B%D0%94%D0%A1%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%20%D0%BB%D1%91%D0%B4%20A',
        phoneHref: 'tel:+79101301777',
        schedule: ['Будни: 15:00-21:00', 'Выходные: 10:00-18:30', 'Family ice и индивидуальные окна по записи'],
      },
      {
        city: 'Нижний Новгород',
        address: 'ФОК Нижний, лёд B',
        note: 'Командный ритм, сборы и матчевая практика.',
        image: '/homepage-school/map-nizhny.svg',
        routeHref:
          'https://yandex.ru/maps/?text=%D0%A4%D0%9E%D0%9A%20%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%BB%D1%91%D0%B4%20B',
        phoneHref: 'tel:+79101301777',
        schedule: ['Будни: 14:00-20:30', 'Выходные: 11:00-17:00', 'Просмотры и игровые окна по согласованию'],
      },
    ] satisfies HomepageLocation[],
  },
  footer: {
    blurb:
      'Школа, команды, аренда льда и связь с Gorilla Hockey в одном месте.',
    groups: [
      {
        title: 'Школа',
        links: [
          { label: 'Главная', href: '#hero' },
          { label: 'Новости', href: '#news' },
          { label: 'Тренировки', href: '#trainings' },
          { label: 'Тренеры', href: '#trainers' },
          { label: 'Отзывы', href: '#testimonials' },
        ],
      },
      {
        title: 'Команды',
        links: [
          { label: 'Москва', href: '#teams' },
          { label: 'Нижний Новгород', href: '#teams' },
          { label: 'Аренда льда', href: '#rent' },
          { label: 'Игра за скидку', href: '#discount-game' },
        ],
      },
      {
        title: 'Связь',
        links: [
          { label: 'Telegram', href: 'https://t.me/Gorillahockeyacademy' },
          { label: 'WhatsApp', href: 'https://wa.me/79101301777' },
          { label: 'Телефон', href: 'tel:+79101301777' },
          { label: 'Сайт', href: 'https://gorillahockey.ru' },
        ],
      },
    ] satisfies HomepageFooterLinkGroup[],
  },
} as const;

export type HomepageSchoolContent = typeof homepageSchoolContent;
