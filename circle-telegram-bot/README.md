# Circle Telegram Bot 🤖

Telegram бот для платформы Circle - точка входа для пользователей в экосистему приложения.

## Функции

- **Команда /start** - приветствие и кнопка WebApp
- **Команды навигации** - /profile, /tours, /communities
- **WebApp интеграция** - прямые ссылки на разделы приложения
- **Интерактивные кнопки** - "Как это работает?" с подробным описанием

## Установка и запуск

### 1. Установка зависимостей

```bash
cd circle-telegram-bot
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Скопируйте `env.example` в `.env` и заполните своими данными:

```bash
cp env.example .env
```

Отредактируйте `.env`:
```
TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
WEBAPP_URL=https://your-domain.com
BACKEND_API_URL=http://127.0.0.1:8001/api/v1
```

### 3. Запуск бота

```bash
python main.py
```

## Создание бота в BotFather

1. Напишите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Получите токен и добавьте в `.env`
5. Настройте команды:
   ```
   /setcommands
   start - 🚀 Начать работу с Circle
   help - ❓ Помощь
   profile - 👤 Мой профиль
   tours - 🗺️ Найти туры
   communities - 💬 Сообщества
   ```

## Структура проекта

```
circle-telegram-bot/
├── main.py              # Основной файл бота
├── requirements.txt     # Python зависимости
├── env.example         # Пример переменных окружения
└── README.md           # Этот файл
```

## Интеграция с WebApp

Бот служит точкой входа в WebApp через кнопки с `web_app` параметром:

- Главная кнопка: весь WebApp
- /profile: `/profile` страница
- /tours: `/tours` страница  
- /communities: `/communities` страница

## Следующие шаги

- [ ] Добавить webhook для production
- [ ] Интеграция с Django backend для уведомлений
- [ ] Менеджерский интерфейс для турагентств
- [ ] Обработка платежей через Payme

## Development

Для разработки рекомендуется использовать polling режим (уже настроен в main.py).

Для production нужно настроить webhook. 