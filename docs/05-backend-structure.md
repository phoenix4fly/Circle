# Backend (детальная структура)

## 📌 ✅ Общий стек
- **Django 4.x**
- **Django REST Framework**
- **Celery + Redis** (фоновые задачи)
- **PostgreSQL**
- **Docker**

## ✅ A. Apps и их ответственность

### 🟢 users
- Регистрация через Telegram (с сохранением telegram_id, username)
- Профиль пользователя (имя, фамилия, интересы, сфера)
- Фото профиля (аватар)
- Авторизация
- Связи (друзья, Circle)

**✅ Важное:**
- Telegram-авторизация как основной вход
- Поля для сегментации (сфера, специализация)
- Накопленный бонусный баланс

### 🟢 tours
- Тур как продукт
- Сессии (конкретные даты тура)
- Категории/типы туров
- Параметры и опции тура
- Фото и галереи
- Чаты тура
- Акции/скидки/промокоды

**✅ Важное:**
- Гибкая структура (тип тура → параметры)
- JSONField для опций транспорта
- ManyToMany участников тура
- Тур-сессии с датами и ценами
- Поддержка скидок (Promotion) и промокодов (PromoCode)

### 🟢 bookings
- Заявки на бронирование
- Статусная модель (requested / approved / paid / cancelled / expired)
- Привязка к TourSession
- Поле promo_code
- Учет использования бонусного баланса
- Финальная цена после скидок
- Комментарии к брони
- Подтверждение менеджером
- Интеграция с Telegram-ботом для уведомлений

**✅ Важное:**
- Логика удержания заявки (60 мин)
- Проверка мест при подтверждении
- Связь с оплатами через статус paid

### 🟢 payments
- Платежные транзакции
- Учёт входящих оплат через Payme
- Учёт выплат (Payme Payout)
- Финансовый учёт комиссий платформы
- Split-интеграция (на перспективу)
- Привязка к Booking
- История платежей

**✅ Важное:**
- Поля Payme Invoice ID
- Статусы оплаты
- Поддержка возвратов

### 🟢 agencies
- Информация о турагентствах
- Контакты, описание
- Логотип
- Payme Merchant ID
- Процент комиссии
- Список менеджеров
- Активность/блокировка

**✅ Важное:**
- Видимость туров только своей компании
- Счет для приёма оплат

### 🟢 referrals
- Учёт партнёров/блогеров
- Уникальный реферальный код
- Расчет комиссий
- Баланс реферала
- Заявки на вывод средств
- Лог истории выплат

**✅ Важное:**
- Возможность вывести на карту через Payme
- Задержка 7 дней перед доступностью бонусов
- Трекинг по заказам

### 🟢 media
- Хранение медиа-файлов
- Фото туров
- Галереи
- Логотипы агентств
- Аватарки пользователей
- Путь сохраняется в FileField
- Сами файлы на диске/облаке

**✅ Важное:**
- Ссылки хранятся в БД
- Сами медиа — вне БД (файловая система/S3)

### 🟢 core
- Логирование действий
- Настройки платформы (в будущем)
- Системные уведомления
- Общие утилиты
- Хранение лога событий (user_id, role, action, details)

**✅ Важное:**
- Для аудита и аналитики
- Записи с timestamp

## ✅ B. Ключевые модели (сводно)

### ✅ User
- telegram_id
- username
- имя, фамилия
- аватар
- баланс бонусов

### ✅ TravelAgency
- name
- description
- payme_merchant_id
- commission_percent

### ✅ Tour
- title, description
- category
- parameters (JSON)
- agency
- transport_options
- gallery
- participants

### ✅ TourSession
- tour
- date_start, date_end
- price
- available_seats
- promotions
- promo_codes

### ✅ Promotion
- session
- discount_percent / discount_amount
- validity

### ✅ PromoCode
- code
- session
- discount
- usage_limit

### ✅ Booking
- user
- session
- seats_reserved
- selected_transport
- promo_code
- final_price
- status (requested/approved/paid/etc)
- approved_by
- expires_at
- comment

### ✅ PaymentTransaction
- booking
- agency
- amount
- payme_invoice_id
- status

### ✅ AccountingTransaction
- agency
- amount
- type (commission, payout)
- status

### ✅ ReferralPartner
- user
- code
- commission_percent
- total_sales
- total_commission_paid
- is_active

### ✅ ReferralBonus
- user
- amount
- status (pending/available/withdrawn)
- available_at

### ✅ ReferralPayoutRequest
- user
- amount
- card_number
- status

### ✅ Media
- file
- uploader
- type

### ✅ Core.Log
- user_id
- role
- action
- details
- timestamp

## ✅ C. Основные API endpoints (примеры)

### ✅ /api/users/
- register/
- profile/
- update/
- avatar/

### ✅ /api/tours/
- list/
- detail/{id}/
- sessions/
- promotions/
- promo-codes/

### ✅ /api/bookings/
- POST (создать заявку)
- /my/ (мои заявки)
- /pending/ (для менеджеров)
- /{id}/approve/
- /{id}/reject/

### ✅ /api/payments/
- transactions/
- payout-requests/

### ✅ /api/agencies/
- list/
- detail/
- create/
- update/

### ✅ /api/referrals/
- partners/
- bonuses/
- payout-requests/

### ✅ /api/media/
- upload/
- list/
- delete/

### ✅ /api/core/
- logs/

## ✅ D. Примеры флоу

### ✅ Флоу 1: Бронирование тура
1. Пользователь авторизуется через Telegram WebApp
2. Выбирает тур и сессию (дату)
3. Оформляет заявку (Booking с статусом requested)
4. Менеджер агентства видит заявку через бот/админку
5. Менеджер → Approve → статус = approved
6. Пользователь получает уведомление через Telegram
7. Пользователь оплачивает (Payme инвойс)
8. Backend фиксирует PaymentTransaction
9. Статус Booking = paid

### ✅ Флоу 2: Использование промокода
1. Пользователь вводит промокод при бронировании
2. Backend проверяет PromoCode (валидность, лимиты)
3. Рассчитывает скидку
4. Сохраняет promo_code в Booking
5. Финальная цена учитывает скидку

### ✅ Флоу 3: Реферальные выплаты
1. Пользователь бронирует по реферальному коду
2. Сохраняется связь Booking → ReferralPartner
3. На аккаунт партнёра начисляется ReferralBonus (pending)
4. Через 7 дней → status = available
5. Партнёр подает заявку на вывод
6. Админ подтверждает → Payme Payout
7. Статус заявки = Выплачено

### ✅ Флоу 4: Заявка на кастомный тур (V2)
1. Пользователь заполняет конструктор
2. Отправляется CustomTripRequest
3. Агентства видят в личном кабинете
4. Отвечают предложениями
5. Пользователь выбирает вариант
6. Создается Booking

## ✅ Короткое резюме:

> **«Backend Circle разделён на модули (users, tours, bookings, payments и др.), имеет хорошо нормализованную структуру БД на PostgreSQL и обеспечивает REST API для фронта и Telegram-бота. Логика охватывает регистрацию, бронирование, оплату через Payme, управление турами, агентствами, рефералами и бонусами.»** 