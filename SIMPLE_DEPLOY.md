# ⚡ Простой деплой Circle БЕЗ Docker

## 🚀 От кода до production за 10 минут!

### **1. 📋 Подготовка сервера Beget VPS**

```bash
# Подключение к серверу
ssh user@your-server-ip

# Клонирование проекта
git clone https://github.com/your-username/circle.git
cd circle

# Сделать скрипт исполняемым
chmod +x simple-deploy.sh
```

### **2. 🔧 Установка зависимостей**

```bash
# Установка всех системных зависимостей одной командой
./simple-deploy.sh install-deps

# Это установит:
# - Python 3 + pip + venv
# - PostgreSQL + Redis
# - Node.js 18+ + npm
# - Nginx
# - PM2 (менеджер процессов)
```

### **3. ⚙️ Настройка проекта**

```bash
# Настройка проекта и виртуального окружения
./simple-deploy.sh setup-project

# Копирование конфигурации
cp production.env /var/www/circle/.env
nano /var/www/circle/.env
```

**В .env измените:**
```env
SECRET_KEY=ваш-50-символьный-ключ
ALLOWED_HOSTS=circles.uz,www.circles.uz,ваш-ip
DB_PASSWORD=сильный-пароль
TELEGRAM_BOT_TOKEN=токен-от-botfather
NEXT_PUBLIC_API_URL=http://ваш-ip:8000/api/v1
```

### **4. 🗄️ Настройка базы данных**

```bash
# Настройка PostgreSQL и миграции
./simple-deploy.sh setup-db

# Скрипт:
# - Создаст базу circle_db
# - Создаст пользователя circle_user
# - Выполнит миграции Django
# - Предложит создать суперпользователя
```

### **5. 🌐 Настройка Nginx**

```bash
# Настройка reverse proxy
./simple-deploy.sh setup-nginx

# Это настроит:
# - / → Next.js (порт 3000)
# - /api/ → Django (порт 8000)  
# - /admin/ → Django Admin
# - /static/ и /media/ → статика
```

### **6. 🚀 Запуск!**

```bash
# Сборка и запуск всех сервисов
./simple-deploy.sh build
./simple-deploy.sh start

# Проверка статуса
./simple-deploy.sh status
```

### **7. ✅ Проверка**

```bash
# Проверка сервисов
curl -I http://ваш-ip/
curl -I http://ваш-ip/api/health/
curl -I http://ваш-ip/admin/

# Логи
./simple-deploy.sh logs
```

---

## 🎛️ Управление

```bash
# Просмотр всех команд
./simple-deploy.sh help

# Основные команды
./simple-deploy.sh start     # Запуск
./simple-deploy.sh stop      # Остановка  
./simple-deploy.sh restart   # Перезапуск
./simple-deploy.sh deploy    # Обновление
./simple-deploy.sh status    # Статус
./simple-deploy.sh logs      # Логи
./simple-deploy.sh backup    # Бэкап
```

---

## 🌐 Настройка домена

### **1. В панели Beget:**
- Добавьте A-запись: `circles.uz` → `IP сервера`
- Добавьте A-запись: `www.circles.uz` → `IP сервера`

### **2. Обновите .env:**
```env
NEXT_PUBLIC_API_URL=https://circles.uz/api/v1
```

### **3. Перезапустите frontend:**
```bash
cd /var/www/circle/circle-frontend
pm2 restart circle-frontend
```

---

## 🔒 SSL сертификат (опционально)

```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d circles.uz -d www.circles.uz

# Обновление Nginx конфигурации для HTTPS
# (добавить SSL блок в /etc/nginx/sites-available/circle)

# Обновить .env
echo "USE_TLS=True" >> /var/www/circle/.env

# Перезапуск
sudo systemctl restart nginx
./simple-deploy.sh restart
```

---

## 📊 Архитектура

```
🌐 Internet (circles.uz)
    ↓
🔄 Nginx (порт 80/443)
    ├── / → Next.js (порт 3000)
    ├── /api/ → Django (порт 8000)
    ├── /admin/ → Django Admin
    └── /static/, /media/ → файлы

📱 PM2 управляет процессами:
    ├── circle-backend (Gunicorn)
    ├── circle-frontend (Next.js)
    └── circle-worker (Celery)

💾 Данные:
    ├── PostgreSQL (база данных)
    └── Redis (кеш + очереди)
```

---

## 🔧 Troubleshooting

### **Проблема: Порт занят**
```bash
sudo fuser -k 80/tcp
sudo fuser -k 3000/tcp
sudo fuser -k 8000/tcp
./simple-deploy.sh restart
```

### **Проблема: Frontend не доступен**
```bash
./simple-deploy.sh logs circle-frontend
cd /var/www/circle/circle-frontend
npm run build
pm2 restart circle-frontend
```

### **Проблема: API не работает**
```bash
./simple-deploy.sh logs circle-backend
cd /var/www/circle/circle-backend
source ../.venv/bin/activate
python manage.py check
pm2 restart circle-backend
```

### **Проблема: База данных**
```bash
sudo systemctl status postgresql
sudo -u postgres psql
# \l - список баз
# \q - выход
```

---

## 🔄 Обновление

```bash
# Простое обновление
cd /var/www/circle
git pull origin main
./simple-deploy.sh deploy

# Полное обновление с dependencies
./simple-deploy.sh setup-project
./simple-deploy.sh build
./simple-deploy.sh restart
```

---

## 💾 Backup

```bash
# Создание бэкапа
./simple-deploy.sh backup

# Автоматические бэкапы (crontab)
crontab -e
# Добавить: 0 2 * * * /var/www/circle/simple-deploy.sh backup
```

---

## 🎉 Готово!

**✅ Circle запущен на production без Docker!**

**🌐 URL:** http://ваш-ip (позже https://circles.uz)  
**👤 Админка:** http://ваш-ip/admin/  
**📱 Telegram:** @ваш_бот

**📞 Поддержка:** PM2 автоматически перезапустит процессы при сбоях! 