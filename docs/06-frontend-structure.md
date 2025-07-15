# Frontend (детальная структура)

## ✅ 📌 A. Технологии

- **Next.js 14+** (React 18+)
- **TypeScript** — строгая типизация
- **Tailwind CSS** — дизайн-система и стили
- **Redux Toolkit** (или Zustand) — глобальное состояние
- **React Query / SWR** — для API-запросов
- **ShadCN/UI** или Headless UI — для готовых компонентов
- **Axios** — для вызовов API
- **Telegram WebApp API** — интеграция
- **PWA** (по желанию) — оффлайн/иконка на экране
- **CI/CD** → Vercel/Netlify/Render/Custom

## ✅ 📌 B. Общая структура папок (пример)

```
src/
  ├── pages/
  │     ├── index.tsx
  │     ├── tours/
  │     │     ├── index.tsx
  │     │     └── [id].tsx
  │     ├── bookings/
  │     │     ├── index.tsx
  │     │     └── [id].tsx
  │     ├── profile/
  │     │     └── index.tsx
  │     ├── auth/
  │     │     ├── login.tsx
  │     │     └── register.tsx
  │     ├── admin/
  │     │     ├── dashboard.tsx
  │     │     ├── agencies.tsx
  │     │     └── payments.tsx
  │     └── agency/
  │           ├── dashboard.tsx
  │           ├── tours.tsx
  │           ├── bookings.tsx
  │           └── referrals.tsx
  │
  ├── components/
  │     ├── Layout/
  │     │     ├── Navbar.tsx
  │     │     ├── Sidebar.tsx
  │     │     └── Footer.tsx
  │     ├── Tour/
  │     │     ├── TourCard.tsx
  │     │     ├── TourSessionCard.tsx
  │     │     └── TourChatModal.tsx
  │     ├── Booking/
  │     │     ├── BookingCard.tsx
  │     │     └── BookingForm.tsx
  │     ├── Agency/
  │     │     ├── AgencyCard.tsx
  │     │     └── ReferralTable.tsx
  │     └── Shared/
  │           ├── Button.tsx
  │           ├── Input.tsx
  │           ├── Modal.tsx
  │           └── Loader.tsx
  │
  ├── features/
  │     ├── auth/
  │     ├── tours/
  │     ├── bookings/
  │     ├── payments/
  │     ├── referrals/
  │     └── profile/
  │
  ├── store/
  │     ├── slices/
  │     │     ├── userSlice.ts
  │     │     ├── tourSlice.ts
  │     │     ├── bookingSlice.ts
  │     │     └── referralSlice.ts
  │     └── index.ts
  │
  ├── styles/
  │     └── globals.css
  │
  ├── utils/
  │     ├── apiClient.ts
  │     └── auth.ts
  │
  └── app.tsx
```

## ✅ 📌 C. Основные страницы

### ⭐ Пользовательский (клиент)
- **/** — Главная страница
- **/tours** — Каталог туров
- **/tours/[id]** — Страница тура
- **/bookings** — Мои заявки
- **/profile** — Мой профиль
- **/checkout** — Оплата

### ⭐ Агентство (менеджер)
- **/agency/dashboard** — Сводка
- **/agency/tours** — Управление турами
- **/agency/bookings** — Все заявки на туры
- **/agency/referrals** — Приглашенные блогеры, выплаты
- **/agency/analytics** — Графики (позже)

### ⭐ Администратор
- **/admin/dashboard** — Обзор
- **/admin/agencies** — Управление агентствами
- **/admin/users** — Все пользователи
- **/admin/bookings** — Все брони
- **/admin/payments** — Транзакции
- **/admin/referrals** — Управление рефералами
- **/admin/logs** — Логирование действий

## ✅ 📌 D. UX потоки

### ✅ Пользовательский флоу
1. Заходит через Telegram WebApp
2. Авторизация по Telegram ID
3. Заполняет профиль
4. Выбирает тур → дату → бронирует
5. Ожидает подтверждения → получает уведомление в Telegram
6. Оплата через Payme (интеграция через кнопку)
7. Получает чек и доступ в чат тура

**✅ Особенности:**
- Пуш через Telegram
- Inline кнопки для оплаты
- Информация о статусе заявки

### ✅ Агентский флоу
1. Логин в Agency панель
2. Просмотр своих туров
3. Добавление/редактирование сессий
4. Получение новых заявок
5. Подтверждение/отклонение
6. Просмотр реферальных бонусов
7. Статистика оплат и комиссий

**✅ Особенности:**
- Доступ только к своим данным
- Уведомления в Telegram

### ✅ Админский флоу
1. Доступ ко всем агентствам
2. Управление пользователями
3. Просмотр всех броней
4. Проверка и подтверждение выплат блогерам
5. Финансовая аналитика
6. Логи действий

**✅ Особенности:**
- Полные права
- Включает approve/reject payouts

## ✅ 📌 E. Как разделён доступ

| Роль | Возможности |
|------|-------------|
| **User** | - Просмотр туров<br>- Бронирование<br>- Оплата<br>- Личный кабинет<br>- История заявок |
| **Agency** | - Управление своими турами<br>- Просмотр и подтверждение заявок<br>- Просмотр оплат<br>- Управление рефералами и выплатами |
| **Admin** | - Все агентства<br>- Все пользователи<br>- Все оплаты и брони<br>- Логи<br>- Выплаты партнёрам |

## ✅ 📌 F. Интеграции

### **Telegram WebApp**
- Авторизация
- Inline кнопки
- Чат-бот уведомления

### **Payme**
- Оплата туров
- Выплаты на карту

### **Backend REST API**
- Вся бизнес-логика

## ✅ 📌 G. Дополнительно (Будущее)

- Поддержка Apple/Google Pay
- S3 / Cloud Storage для медиа
- Мультиязычность
- PWA режим
- Аналитика поведения пользователей

## ✅ Короткое резюме:

> **«Frontend Circle строится на Next.js и Telegram WebApp, разделён на модули (User / Agency / Admin), включает каталог туров, бронирование, оплату Payme и личные кабинеты. Гибкая структура позволяет легко масштабировать функционал.»** 