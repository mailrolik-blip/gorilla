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

export type HomepageLiveStream = {
  title: string;
  date: string;
  status: 'upcoming' | 'replay';
  href: string;
  detail: string;
};

export type HomepageLiveStreamsSection = {
  eyebrow: string;
  title: string;
  description: string;
  items: HomepageLiveStream[];
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
  price: string;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

export type HomepageGalleryItem = {
  title: string;
  image: string;
  source?: string;
};

export type HomepageResultItem = {
  label: string;
  value: string;
};

export type HomepageTeam = {
  city: string;
  teamName: string;
  league: string;
  description: string;
  achievement: string;
  image: string;
  gallery: HomepageGalleryItem[];
  results: HomepageResultItem[];
  players: string[];
  ctaHref: string;
  ctaLabel: string;
};

export type HomepageTrainer = {
  name: string;
  role: string;
  age: string;
  experience: string;
  image: string;
  specialization: string[];
  achievements: string[];
};

export type HomepageRentVenue = {
  title: string;
  subtitle: string;
  city: string;
  format: string;
  image: string;
  gallery: string[];
  badges: string[];
  facts: string[];
  termsTitle: string;
  terms: string[];
  contacts?: string[];
  address: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  tertiaryCta: { label: string; href: string };
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
    logoSrc: '/homepage-school/gorilla-logo-v2.png',
    logoAlt: 'Логотип Gorilla Hockey',
    phoneLabel: '+7 (910) 130-17-77',
    phoneHref: 'tel:+79101301777',
    telegramLabel: 'Telegram',
    telegramHref: 'https://t.me/Gorillahockeyacademy',
    whatsappLabel: 'WhatsApp',
    whatsappHref: 'https://wa.me/79101301777',
    websiteLabel: 'gorillahockey.ru',
    websiteHref: 'https://gorillahockey.ru',
    loginHref: '/login',
    cabinetHref: '/cabinet',
    registerHref: '/register',
  },
  menu: [
    { label: 'О школе', href: '#hero', mobileLabel: 'Главная' },
    { label: 'Новости', href: '#news', mobileLabel: 'Новости' },
    { label: 'Трансляции', href: '#live', mobileLabel: 'Live' },
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
      'Показываем свежие посты школы прямо на главной: наборы, расписание, тренировки и важные клубные обновления.',
    ctaLabel: 'Открыть канал',
    ctaHref: 'https://t.me/Gorillahockeyacademy',
  } satisfies HomepageNewsSection,
  liveStreams: {
    eyebrow: 'Трансляции',
    title: 'Матчи и записи клуба',
    description:
      'Предстоящие эфиры и записи игр Gorilla Hockey в одном блоке.',
    items: [
      {
        title: 'Gorilla Hockey Moscow - домашний матч',
        date: 'Суббота - 18:30',
        status: 'upcoming',
        href: 'https://t.me/Gorillahockeyacademy',
        detail: 'Прямой эфир появится в канале перед стартовым вбрасыванием.',
      },
      {
        title: 'Тренерский разбор недели',
        date: 'Воскресенье - 12:00',
        status: 'upcoming',
        href: 'https://t.me/Gorillahockeyacademy',
        detail: 'Короткий эфир с тренерскими комментариями и планом на неделю.',
      },
      {
        title: 'Gorilla Hockey Nizhny - игровой день',
        date: 'Запись от 18 мая',
        status: 'replay',
        href: 'https://t.me/Gorillahockeyacademy',
        detail: 'Полная запись матча и главные эпизоды для родителей и игроков.',
      },
    ],
  } satisfies HomepageLiveStreamsSection,
  hero: {
    eyebrow: 'Набор в сезон 2026/27',
    title: 'Gorilla Hockey',
    description:
      'Хоккейная школа и команда: тренировки, заявки, игры и развитие игроков в Москве и Нижнем Новгороде.',
    chips: ['От 5 лет', '2 города', 'Тренировки и заявки'],
    primaryCta: { label: 'Подать заявку', href: '#trainings' },
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
      { value: 'GH', label: 'Gorilla Hockey' },
    ],
    primaryImage: '/homepage-school/hero-ice-arena.svg',
  },
  stats: [
    {
      value: '1',
      label: 'маршрут от первой тренировки',
      detail: 'Помогаем выбрать стартовый формат, записаться на лёд и дальше двигаться к группе, просмотру или индивидуальной работе.',
      href: '#trainings',
      cta: 'Выбрать формат',
    },
    {
      value: '24/7',
      label: 'запись через кабинет',
      detail: 'Тренировки, бронирование льда и заявки собраны в личном кабинете, чтобы не терять переписку и статусы.',
      href: '#trainings',
      cta: 'Перейти к записи',
    },
    {
      value: 'Live',
      label: 'матчи и записи из Telegram',
      detail: 'Видео и клубные новости подтягиваются из канала, поэтому главная показывает актуальные материалы без ручной загрузки.',
      href: '#live',
      cta: 'Смотреть записи',
    },
    {
      value: '4',
      label: 'сезонных сбора',
      detail: 'Интенсивы помогают добавить объём льда и точечно усилить подготовку в ключевые отрезки сезона.',
      href: '#trainings',
      cta: 'Узнать формат',
    },
    {
      value: 'GP',
      label: 'Gorilla Points за активность',
      detail: 'Мини-игра и клубные задания связывают сайт с кабинетом: баллы копятся и открывают фиксированные награды.',
      href: '#discount-game',
      cta: 'Открыть игру',
    },
    {
      value: '2',
      label: 'точки связи с администратором',
      detail: 'Telegram и телефон остаются быстрым способом уточнить слот, условия аренды или первый пробный выход.',
      href: '#location',
      cta: 'Открыть контакты',
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
        subtitle: 'Первый лёд и базовая уверенность.',
        audience: 'Старт для начинающих игроков',
        image: '/homepage-school/training/training-kids.jpg',
        badges: ['5-8 лет', 'Первый лёд'],
        price: 'от 1 800 ₽',
        ctaLabel: 'Записаться',
        ctaHref: '/cabinet',
        featured: true,
      },
      {
        title: 'Дети и родители',
        subtitle: 'Совместный лёд для ребёнка и родителя.',
        audience: 'Family ice',
        image: '/homepage-school/training/training-family.jpg',
        badges: ['Family ice', 'Вместе'],
        price: 'от 2 500 ₽',
        ctaLabel: 'Выбрать слот',
        ctaHref: '/cabinet',
      },
      {
        title: 'Средняя группа',
        subtitle: 'Игровой темп и работа в группе.',
        audience: 'Рост темпа и уверенности',
        image: '/homepage-school/training/training-middle.jpg',
        badges: ['U10-U12', 'Группа'],
        price: 'от 2 200 ₽',
        ctaLabel: 'Перейти к записи',
        ctaHref: '/cabinet',
      },
      {
        title: 'Старшая группа',
        subtitle: 'Подготовка к матчевому ритму.',
        audience: 'Высокий темп',
        image: '/homepage-school/training/training-senior.jpg',
        badges: ['U13+', 'Матчи'],
        price: 'от 2 400 ₽',
        ctaLabel: 'Записаться',
        ctaHref: '/cabinet',
      },
      {
        title: 'Индивидуальные занятия',
        subtitle: 'Точечная работа под задачу игрока.',
        audience: 'Персональный маршрут',
        image: '/homepage-school/training/training-individual.jpg',
        badges: ['1 на 1', 'Бросок'],
        price: 'от 4 000 ₽',
        ctaLabel: 'Подобрать формат',
        ctaHref: '/cabinet',
      },
    ] satisfies HomepageTrainingType[],
  },
  teams: {
    eyebrow: 'Команды',
    title: 'Команды Gorilla Hockey',
    description:
      'Показываем только проверенную информацию. Составы, матчи и публичное расписание обновляются отдельно, чтобы не выдавать неподтверждённые данные за официальные.',
    items: [
      {
        city: 'Москва',
        teamName: 'GORILLA HOCKEY',
        league: 'Детские тренировочные группы',
        description:
          'Хоккейный проект Gorilla Hockey ведёт детские группы, просмотры и подготовку игроков. Официальные составы и матчи появятся на главной после ручного подтверждения.',
        achievement:
          'Составы и расписание обновляются.',
        image: '/homepage-school/teams/moscow-gallery-final.jpg',
        gallery: [
          { title: 'Тренировочный процесс', image: '/homepage-school/teams/moscow-gallery-final.jpg', source: 'Gorilla Hockey' },
          { title: 'Командная работа', image: '/homepage-school/teams/moscow-gallery-lineup.jpg', source: 'Gorilla Hockey' },
          { title: 'Игровая практика', image: '/homepage-school/teams/moscow-gallery-match.jpg', source: 'Gorilla Hockey' },
        ],
        results: [
          { label: 'Формат', value: 'Детские и подростковые тренировочные группы.' },
          { label: 'Расписание', value: 'Публикуется после подтверждения администратором.' },
          { label: 'Матчи', value: 'Официальные игры появятся после ручной проверки.' },
        ],
        players: [
          'Публичный состав не опубликован',
          'Статистика матчей не выводится без подтверждения',
          'Заявки принимаются через сайт',
          'Тренер согласует подходящую группу',
        ],
        ctaHref: '/register',
        ctaLabel: 'Подать заявку',
      },
      {
        city: 'Нижний Новгород',
        teamName: 'GORILLA HOCKEY',
        league: 'Взрослые группы и индивидуальная работа',
        description:
          'В Нижнем Новгороде Gorilla Hockey развивает тренировочный контур, бросковую зону и индивидуальную работу. Турнирные данные не выводятся без отдельного публичного подтверждения.',
        achievement:
          'Составы и расписание обновляются.',
        image: '/homepage-school/teams/nizhny-team-rhl.jpg',
        gallery: [
          { title: 'Нижний Новгород', image: '/homepage-school/teams/nizhny-team-rhl.jpg', source: 'Gorilla Hockey' },
          { title: 'Сборы и тренировки', image: '/homepage-school/teams/nizhny-gallery-camp.jpg', source: 'Gorilla Hockey' },
          { title: 'Мастер-класс', image: '/homepage-school/teams/nizhny-gallery-masterclass.jpg', source: 'Gorilla Hockey' },
        ],
        results: [
          { label: 'Формат', value: 'Тренировочные группы и индивидуальная подготовка.' },
          { label: 'Расписание', value: 'Слоты согласуются через заявку или администратора.' },
          { label: 'Матчи', value: 'Официальные игры появятся после ручной проверки.' },
        ],
        players: [
          'Публичный состав не опубликован',
          'Статистика матчей не выводится без подтверждения',
          'Запись доступна через кабинет',
          'Администратор уточнит формат тренировки',
        ],
        ctaHref: '/cabinet',
        ctaLabel: 'Записаться на тренировку',
      },
    ] satisfies HomepageTeam[],
  },
  trainers: {
    eyebrow: 'Тренеры',
    title: 'Тренерский штаб Gorilla Hockey',
    description:
      'Три тренера ведут игроков через катание, владение клюшкой, силовую работу и тактическое понимание игры.',
    items: [
      {
        name: 'Горюнов Денис Петрович',
        role: 'Техника катания, силовое катание, владение клюшкой и шайбой, тактическая работа',
        age: '28 лет',
        experience: '7 лет тренерского опыта',
        image: '/homepage-school/1_1.jpg',
        specialization: [
          'техника катания',
          'силовое катание',
          'техника владения клюшкой и шайбой',
          'тактическая работа',
        ],
        achievements: [
          'серебряный призёр международного турнира среди студентов',
          'золотой и серебряный призёр г. Нижний Новгород высшей лиги',
          'чемпион Нижегородской области и г. Нижний Новгород высшей лиги',
          'серебряный и бронзовый призёр России среди студентов',
          'участник молодёжной хоккейной лиги и высшей хоккейной лиги',
        ],
      },
      {
        name: 'Кузнецов Роман Александрович',
        role: 'Техника катания, силовое катание, владение клюшкой и шайбой, тактическая работа',
        age: '23 года',
        experience: '5 лет тренерского опыта',
        image: '/homepage-school/2.jpg',
        specialization: [
          'техника катания',
          'силовое катание',
          'техника владения клюшкой и шайбой',
          'тактическая работа',
        ],
        achievements: [
          'бронзовый призёр России среди студенческой команды',
          'серебряный призёр международного турнира среди студентов',
          'призёр г. Нижний Новгород высшей лиги',
          'чемпион Нижегородской области',
        ],
      },
      {
        name: 'Гребенщиков Сергей Сергеевич',
        role: 'Техника катания, силовое катание, владение клюшкой и шайбой, тактическая работа',
        age: '28 лет',
        experience: '4 года тренерского опыта',
        image: '/homepage-school/02.jpg',
        specialization: [
          'техника катания',
          'силовое катание',
          'техника владения клюшкой и шайбой',
          'тактическая работа',
        ],
        achievements: [
          'воспитанник школы ЦСКА',
          'призёр чемпионата России в составе сборной Московской области',
          'участник чемпионата МХЛ в командах системы СКА, Атлант',
          'участник чемпионата WSHL и FHL (США)',
          'серебряный призёр чемпионата EIHL (ОАЭ)',
        ],
      },
    ] satisfies HomepageTrainer[],
  },
  iceRent: {
    eyebrow: 'Аренда льда',
    title: 'Лёд для команды, просмотра и частных занятий',
    description:
      'Две реальные площадки Gorilla Hockey: центр подготовки в Нижнем Новгороде и ледовый комплекс в Москве.',
    items: [
      {
        title: 'Центр подготовки хоккеистов Gorilla Hockey',
        subtitle: 'Бросковая зона для индивидуальной отработки, техники и дополнительной работы.',
        city: 'Нижний Новгород',
        format: 'Бросковая зона',
        image: '/homepage-school/brosrovaya/photo_1_2026-05-30_11-38-04.jpg',
        gallery: [
          '/homepage-school/brosrovaya/photo_10_2026-05-30_11-38-04.jpg',
          '/homepage-school/brosrovaya/photo_11_2026-05-30_11-38-04.jpg',
        ],
        badges: ['Нижний Новгород', 'Бросковая дорожка', 'Индивидуальная работа'],
        facts: [
          'индивидуальная отработка',
          'бросковая дорожка и техника',
          'дополнительная работа с тренером',
        ],
        termsTitle: 'Действующие цены',
        terms: ['аренда одной дорожки — 500 рублей', 'занятие с тренером — 1000 рублей'],
        address: 'г. Нижний Новгород, ул. Ларина, 22В',
        primaryCta: { label: 'Записаться', href: '/cabinet' },
        secondaryCta: { label: 'Построить маршрут', href: 'https://yandex.ru/maps/?text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B0%D1%80%D0%B8%D0%BD%D0%B0%2C%2022%D0%92' },
        tertiaryCta: { label: 'Узнать условия', href: 'https://wa.me/79101301777' },
      },
      {
        title: 'Gorilla Hockey Москва',
        subtitle: 'Лёд и зал для детей от 3 до 10 лет в ледовом комплексе «Чемпион».',
        city: 'Москва',
        format: 'Лёд и зал',
        image: '/homepage-school/led_msk/photo_6_2026-05-30_11-39-29.jpg',
        gallery: [
          '/homepage-school/led_msk/photo_1_2026-05-30_11-39-28.jpg',
          '/homepage-school/led_msk/photo_5_2026-05-30_11-39-29.jpg',
        ],
        badges: ['Москва', '3–10 лет', '60 минут'],
        facts: [
          'большой каток для занятий',
          'фирменная экипировка Gorilla',
          'знания опытнейших тренеров',
          'демократичная стоимость уроков',
          'современные душевые, просторная раздевалка и чистые залы',
        ],
        termsTitle: 'Расписание',
        terms: [
          'понедельник / среда / пятница',
          '16:45–17:45 — лёд',
          '18:00–19:00 — зал',
        ],
        contacts: ['+7 (910) 130-17-77', 'WhatsApp: wa.me/79101301777', 'Telegram: @Gorillahockeyacademy'],
        address: 'г. Москва, Парк Горького, ледовый комплекс «Чемпион»',
        primaryCta: { label: 'Записаться', href: '/cabinet' },
        secondaryCta: { label: 'Построить маршрут', href: 'https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9F%D0%B0%D1%80%D0%BA%20%D0%93%D0%BE%D1%80%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2C%20%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81%20%D0%A7%D0%B5%D0%BC%D0%BF%D0%B8%D0%BE%D0%BD' },
        tertiaryCta: { label: 'Узнать условия', href: 'https://wa.me/79101301777' },
      },
    ] satisfies HomepageRentVenue[],
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
        address: 'г. Москва, Парк Горького, ледовый комплекс «Чемпион»',
        note: 'Лёд и зал для детских групп 3–10 лет, просмотров и первых тренировок школы.',
        image: '/homepage-school/map-moscow.svg',
        routeHref: 'https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9F%D0%B0%D1%80%D0%BA%20%D0%93%D0%BE%D1%80%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2C%20%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81%20%D0%A7%D0%B5%D0%BC%D0%BF%D0%B8%D0%BE%D0%BD',
        phoneHref: 'tel:+79101301777',
        schedule: ['Понедельник / среда / пятница', '16:45–17:45 — лёд', '18:00–19:00 — зал', 'Запись и просмотры через администратора'],
      },
      {
        city: 'Нижний Новгород',
        address: 'г. Нижний Новгород, ул. Ларина, 22В',
        note: 'Центр подготовки хоккеистов Gorilla Hockey: бросковая зона и индивидуальная работа.',
        image: '/homepage-school/map-nizhny.svg',
        routeHref:
          'https://yandex.ru/maps/?text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B0%D1%80%D0%B8%D0%BD%D0%B0%2C%2022%D0%92',
        phoneHref: 'tel:+79101301777',
        schedule: ['Бросковая дорожка по записи', 'Аренда одной дорожки — 500 рублей', 'Занятие с тренером — 1000 рублей', 'Индивидуальные окна согласуются с администратором'],
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
