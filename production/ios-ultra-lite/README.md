# Gorilla Hockey — iOS / Telegram stable homepage

Эта директория содержит рабочую production-версию публичной главной,
которая была сделана для устранения чёрного экрана / повторного
неоткрытия сайта в Telegram WebView на iPhone.

ВАЖНО: не заменять обычным Next.js homepage без повторного тестирования iPhone.

Архитектура production:

- публичный `/` обслуживается nginx напрямую;
- frontend главной: React 18 standalone;
- Next.js остаётся для API, login, cabinet, admin и остальных маршрутов;
- на iPhone hero использует один статичный кадр вместо тяжёлой canvas sequence;
- изображения загружаются lazy;
- видео не preloaded;
- тяжёлые секции монтируются через DeferredMount;
- оригинальная Gorilla Mini Hockey игра не переписана:
  она монтируется только при приближении пользователя к игровой секции.

Production runtime files:

- /opt/gorilla-react-home
- /var/www/html/gorilla-react-home.html
- /var/www/html/gorilla-react-home.js
- /etc/nginx/sites-available/gorilla

Перед любым новым deploy обязательно проверить повторное открытие
https://gorillahockey.ru в Telegram на iPhone несколько раз подряд.
