# ⚡ Быстрый старт Circle на Beget

## 🚀 За 5 минут от кода до production!

### **1. 📋 Подготовка сервера (Beget VPS)**

```bash
# Подключение к серверу
ssh user@your-server-ip

# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перелогинивание
exit
ssh user@your-server-ip
```

### **2. 📥 Загрузка проекта**

```bash
# Клонирование (или загрузка архива)
git clone https://github.com/your-username/circle.git
cd circle

# Или загрузка с локальной машины
# scp -r /path/to/circle user@server-ip:~/
```

### **3. ⚙️ Настройка окружения**

```bash
# Копирование конфигурации
cp env.example .env
nano .env
```

**Минимальные изменения в .env:**
```env
# Основные настройки
SECRET_KEY=ваш-50-символьный-ключ-сгенерируйте-новый
ALLOWED_HOSTS=circles.uz,www.circles.uz,ваш-ip-сервера

# Пароли (измените обязательно!)
DB_PASSWORD=сильный-пароль-для-базы
REDIS_PASSWORD=сильный-пароль-для-redis
DJANGO_SUPERUSER_PASSWORD=пароль-для-админки

# Telegram бот
TELEGRAM_BOT_TOKEN=токен-от-@BotFather
NEXT_PUBLIC_TELEGRAM_BOT_NAME=имя_вашего_бота
```

### **4. 🚀 Запуск**

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Деплой одной командой!
./deploy.sh deploy

# Ожидание 2-3 минуты...
# ✅ Готово!
```

### **5. 🔍 Проверка**

```bash
# Статус сервисов
./deploy.sh status

# Проверка в браузере
curl -I http://ваш-ip/
curl -I http://ваш-ip/api/health/

# Админка Django
http://ваш-ip/admin/
```

---

## 🎛️ Управление

```bash
# Просмотр логов
./deploy.sh logs

# Перезапуск
./deploy.sh restart

# Остановка
./deploy.sh stop

# Запуск
./deploy.sh start

# Бэкап
./deploy.sh backup

# Помощь
./deploy.sh help
```

---

## 🌐 Настройка домена

### **В панели Beget:**
1. Добавьте A-запись: `circles.uz` → `IP сервера`
2. Добавьте A-запись: `www.circles.uz` → `IP сервера`

### **SSL сертификат:**
```bash
# Получение Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d circles.uz -d www.circles.uz

# Копирование сертификатов
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/circles.uz/fullchain.pem ssl/circles.uz.crt
sudo cp /etc/letsencrypt/live/circles.uz/privkey.pem ssl/circles.uz.key
sudo chown -R $USER:$USER ssl/

# Раскомментировать SSL блок в nginx.conf
nano circle-backend/docker/nginx.conf

# Перезапуск Nginx
docker-compose restart nginx
```

---

## 🔧 Troubleshooting

### **Проблема: Порты заняты**
```bash
sudo netstat -tulpn | grep :80
sudo fuser -k 80/tcp
./deploy.sh restart
```

### **Проблема: Мало места**
```bash
./deploy.sh clean
docker system prune -af
```

### **Проблема: Мало памяти**
```bash
# Добавить swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📊 Мониторинг

```bash
# Статус системы
./deploy.sh status

# Использование ресурсов
docker stats

# Дисковое пространство
df -h

# Память
free -h

# Логи в реальном времени
./deploy.sh logs backend
```

---

## 🔄 Обновление

```bash
# Простое обновление
git pull origin main
./deploy.sh update

# Или с полной пересборкой
./deploy.sh deploy
```

---

## 🎯 CI/CD с GitHub

### **Настройка GitHub Secrets:**
1. `SSH_PRIVATE_KEY` - ваш приватный SSH ключ
2. `SERVER_HOST` - IP адрес сервера
3. `SERVER_USER` - пользователь на сервере
4. `SLACK_WEBHOOK_URL` - (опционально) для уведомлений

### **Автоматический деплой:**
Каждый push в `main` ветку автоматически:
1. ✅ Тестирует код
2. 🔒 Сканирует на уязвимости  
3. 🏗️ Собирает Docker образы
4. 🚀 Деплоит на сервер
5. 📱 Отправляет уведомления

---

## ✅ Чек-лист готовности

- [ ] 🐳 Docker установлен
- [ ] 📁 Проект загружен
- [ ] ⚙️ .env настроен
- [ ] 🚀 Деплой выполнен
- [ ] 🌐 Домен настроен
- [ ] 🔒 SSL настроен
- [ ] 📊 Мониторинг работает
- [ ] 💾 Бэкапы настроены
- [ ] 🔄 CI/CD настроен

---

**🎉 Поздравляем! Circle работает на production!**

**🌐 URL:** https://circles.uz  
**👤 Админка:** https://circles.uz/admin/  
**📱 Telegram:** @ваш_бот_name

**📞 Поддержка:** Читайте `DEPLOYMENT.md` для детальной документации 