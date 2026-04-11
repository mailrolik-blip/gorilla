const { Telegraf } = require('telegraf');
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();
const bot = new Telegraf('8676091088:AAH2SPQlx0vGci2wPqB2sv0Mn9_SZ2j7q2Y');

// Приветственное сообщение при старте
bot.start((ctx) => {
  ctx.reply('Привет! Я помогу тебе с бронированиями. Для начала зарегистрируйся!');
});

// Команда для регистрации нового пользователя
bot.command('/register', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  // Проверка, существует ли уже пользователь
  const existingUser = await prismaClient.user.findUnique({
    where: { telegramId: telegramId },
  });

  if (existingUser) {
    return ctx.reply('Ты уже зарегистрирован!');
  }

  // Если пользователь не найден, создаем нового
  try {
    await prismaClient.user.create({
      data: {
        telegramId: telegramId,
        // можешь добавить другие поля, если нужно
      },
    });
    ctx.reply('Ты успешно зарегистрирован!');
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    ctx.reply('Произошла ошибка при регистрации. Попробуй снова позже.');
  }
});

// Команда для получения доступных тренировок
bot.command('trainings', async (ctx) => {
  try {
    console.log('Fetching trainings...');
    const trainings = await prismaClient.schoolTraining.findMany();
    console.log('Trainings fetched:', trainings);

    if (trainings.length === 0) {
      return ctx.reply('На данный момент нет доступных тренировок.');
    }

    let response = 'Доступные тренировки:\n';
    trainings.forEach((training, index) => {
      // Предполагаю, что в базе данных поле называется `start_time`
      response += `${index + 1}. ${training.name} - ${training.start_time}\n`;
    });

    ctx.reply(response);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    ctx.reply('Произошла ошибка при получении списка тренировок.');
  }
});

// Команда для бронирования тренировки
bot.command('book', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const user = await prismaClient.user.findUnique({
    where: { telegramId: telegramId },
  });

  if (!user) {
    return ctx.reply('Сначала зарегистрируйся с помощью команды /register');
  }

  const trainingId = ctx.message.text.split(' ')[1]; // Получаем ID тренировки из сообщения

  if (!trainingId) {
    return ctx.reply('Пожалуйста, укажи ID тренировки для бронирования.');
  }

  // Проверяем, существует ли тренировка
  const training = await prismaClient.schoolTraining.findUnique({
    where: { training_id: parseInt(trainingId) },  // предполагается, что это правильное имя поля
  });

  if (!training) {
    return ctx.reply('Тренировка не найдена.');
  }

  // Находим слот для тренировки
  const slot = await prismaClient.schoolTrainingSlots.findFirst({
    where: { trainingId: training.training_id, availableSlots: { gt: 0 } },
  });

  if (!slot) {
    return ctx.reply('Нет доступных мест на эту тренировку.');
  }

  try {
    // Создаем бронирование
    await prismaClient.schoolBookings.create({
      data: {
        userId: user.id,
        slotId: slot.id,
        bookingStatus: 'booked',
        createdAt: new Date(),
      },
    });

    // Обновляем количество забронированных слотов
    await prismaClient.schoolTrainingSlots.update({
      where: { id: slot.id },
      data: { reservedSlots: { increment: 1 } },
    });

    ctx.reply(`Тренировка забронирована на ${training.name}.`);
  } catch (error) {
    console.error('Ошибка при бронировании тренировки:', error);
    ctx.reply('Произошла ошибка при бронировании тренировки. Попробуй снова позже.');
  }
});

// Стартуем бота
bot.launch();