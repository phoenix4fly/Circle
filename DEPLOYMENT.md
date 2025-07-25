# 🚀 Circle Deployment Guide

## Полное руководство по развертыванию Circle на production сервере

### 📋 Содержание

- [Требования к серверу](#требования-к-серверу)
- [Установка зависимостей](#установка-зависимостей)
- [Настройка окружения](#настройка-окружения)
- [Деплой приложения](#деплой-приложения)
- [Управление сервисами](#управление-сервисами)
- [Мониторинг и логи](#мониторинг-и-логи)
- [Backup и восстановление](#backup-и-восстановление)
- [SSL сертификаты](#ssl-сертификаты)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ Требования к серверу

### Минимальные требования:
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM:** 4GB (рекомендуется 8GB)
- **CPU:** 2 cores (рекомендуется 4 cores)
- **Disk:** 50GB SSD (рекомендуется 100GB)
- **Network:** стабильное соединение

### Рекомендуемые требования для production:
- **RAM:** 8GB+
- **CPU:** 4 cores+
- **Disk:** 100GB+ SSD
- **Backup:** отдельный диск для бэкапов

---

## 🔧 Установка зависимостей

### 1. Обновление системы

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Установка Docker

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогинивание или выполнение:
newgrp docker

# Проверка установки
docker --version
```

### 3. Установка Docker Compose

```bash
# Загрузка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Права на выполнение
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker-compose --version
```

### 4. Установка дополнительных утилит

```bash
# Ubuntu/Debian
sudo apt install -y git nano htop curl wget unzip

# CentOS/RHEL
sudo yum install -y git nano htop curl wget unzip
```

---

## ⚙️ Настройка окружения

### 1. Клонирование репозитория

```bash
# Клонирование проекта
git clone https://github.com/your-username/circle.git
cd circle

# Или загрузка архива
wget https://github.com/your-username/circle/archive/main.zip
unzip main.zip
cd circle-main
```

### 2. Настройка переменных окружения

```bash
# Копирование примера конфигурации
cp env.example .env

# Редактирование конфигурации
nano .env
```

### 3. Заполнение .env файла

**Обязательные параметры для изменения:**

```env
# Django
SECRET_KEY=ваш-уникальный-секретный-ключ-длиной-50-символов
ALLOWED_HOSTS=circles.uz,www.circles.uz

# Database
DB_NAME=circle_production
DB_USER=circle_user
DB_PASSWORD=очень-сильный-пароль-для-базы

# Redis
REDIS_PASSWORD=сильный-пароль-для-redis

# Admin
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@circles.uz
DJANGO_SUPERUSER_PASSWORD=безопасный-пароль-админа

# Telegram
TELEGRAM_BOT_TOKEN=ваш-токен-бота-от-botfather
NEXT_PUBLIC_TELEGRAM_BOT_NAME=ваш_бот_name
```

### 4. Генерация секретного ключа Django

```bash
# Генерация случайного ключа
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Или онлайн генератор:
# https://djecrety.ir/
```

---

## 🚀 Деплой приложения

### 1. Предварительная проверка

```bash
# Проверка конфигурации
./deploy.sh help

# Проверка Docker
docker --version
docker-compose --version
```

### 2. Первоначальный деплой

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запуск полного деплоя
./deploy.sh deploy
```

### 3. Проверка статуса

```bash
# Проверка запущенных сервисов
./deploy.sh status

# Просмотр логов
./deploy.sh logs

# Проверка здоровья сервисов
docker-compose ps
```

### 4. Проверка доступности

```bash
# Проверка фронтенда
curl -I http://circles.uz

# Проверка API
curl -I http://circles.uz/api/health/

# Проверка админки
curl -I http://circles.uz/admin/
```

---

## 🎛️ Управление сервисами

### Основные команды

```bash
# Запуск всех сервисов
./deploy.sh start

# Остановка всех сервисов  
./deploy.sh stop

# Перезапуск сервисов
./deploy.sh restart

# Обновление приложения
./deploy.sh update

# Просмотр логов
./deploy.sh logs [service_name]

# Статус системы
./deploy.sh status

# Вход в контейнер
./deploy.sh shell [service_name]
```

### Управление отдельными сервисами

```bash
# Перезапуск конкретного сервиса
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Масштабирование сервисов
docker-compose up -d --scale worker=3
```

---

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Все логи
./deploy.sh logs

# Логи конкретного сервиса
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs nginx

# Логи в реальном времени
docker-compose logs -f --tail=100

# Логи Nginx
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

### Мониторинг ресурсов

```bash
# Статус сервисов
./deploy.sh status

# Использование ресурсов контейнерами
docker stats

# Мониторинг процессов
htop

# Дисковое пространство
df -h

# Использование памяти
free -h
```

### Health checks

```bash
# Проверка health endpoints
curl http://circles.uz/api/health/
curl http://circles.uz/health/

# Проверка конкретных сервисов
docker-compose exec backend python manage.py check
docker-compose exec db pg_isready -U circle_user -d circle_production
```

---

## 💾 Backup и восстановление

### Создание бэкапа

```bash
# Автоматический бэкап
./deploy.sh backup

# Ручной бэкап базы данных
docker-compose exec -T db pg_dump -U circle_user circle_production > backup_$(date +%Y%m%d).sql

# Бэкап медиа файлов
docker cp circle_backend:/app/media ./media_backup_$(date +%Y%m%d)
```

### Восстановление из бэкапа

```bash
# Восстановление базы данных
docker-compose exec -T db psql -U circle_user circle_production < backup_20240125.sql

# Восстановление медиа файлов
docker cp ./media_backup_20240125 circle_backend:/app/media
```

### Настройка автоматических бэкапов

```bash
# Добавление в crontab
crontab -e

# Ежедневный бэкап в 2:00 ночи
0 2 * * * /path/to/circle/deploy.sh backup

# Еженедельная очистка старых бэкапов (старше 30 дней)
0 3 * * 0 find /path/to/circle/backups -name "*.tar.gz" -mtime +30 -delete
```

---

## 🔒 SSL сертификаты

### Получение Let's Encrypt сертификата

```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d circles.uz -d www.circles.uz

# Копирование сертификатов
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/circles.uz/fullchain.pem ssl/circles.uz.crt
sudo cp /etc/letsencrypt/live/circles.uz/privkey.pem ssl/circles.uz.key
sudo chown -R $USER:$USER ssl/
```

### Обновление конфигурации Nginx для SSL

Раскомментируйте SSL блок в `circle-backend/docker/nginx.conf` и перезапустите:

```bash
# Редактирование конфигурации
nano circle-backend/docker/nginx.conf

# Перезапуск Nginx
docker-compose restart nginx
```

### Автообновление сертификатов

```bash
# Добавление в crontab
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

---

## 🔧 Troubleshooting

### Частые проблемы и решения

#### 1. Сервисы не запускаются

```bash
# Проверка логов
./deploy.sh logs

# Проверка портов
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Освобождение портов
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

#### 2. База данных недоступна

```bash
# Проверка статуса PostgreSQL
docker-compose exec db pg_isready -U circle_user -d circle_production

# Проверка подключения
docker-compose exec backend python manage.py dbshell

# Пересоздание базы данных
docker-compose down
docker volume rm circle_postgres_data
./deploy.sh deploy
```

#### 3. Проблемы с памятью

```bash
# Очистка Docker кеша
./deploy.sh clean

# Увеличение swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Медленная работа

```bash
# Оптимизация Docker
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

# Мониторинг ресурсов
docker stats --no-stream
```

#### 5. Проблемы с сертификатами

```bash
# Проверка сертификата
openssl x509 -in ssl/circles.uz.crt -text -noout

# Тест SSL
curl -I https://circles.uz
```

---

## 📈 Оптимизация для production

### Настройка файрвола

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Iptables (CentOS)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Настройка swap

```bash
# Создание swap файла
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Автозагрузка swap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Мониторинг дискового пространства

```bash
# Автоматическая очистка логов
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json

# Настройка logrotate
sudo nano /etc/logrotate.d/circle
```

---

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте логи:** `./deploy.sh logs`
2. **Проверьте статус:** `./deploy.sh status`
3. **Проверьте конфигурацию:** `.env` файл
4. **Обратитесь к документации:** этот файл
5. **Создайте issue** в репозитории проекта

### Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**✅ Поздравляем! Circle успешно развернут на production сервере!** 🎉 