#!/bin/bash
set -e

# Функция для ожидания готовности базы данных
wait_for_db() {
    echo "🔍 Waiting for database..."
    while ! nc -z $DB_HOST $DB_PORT; do
        echo "⏳ Database is unavailable - sleeping"
        sleep 1
    done
    echo "✅ Database is ready!"
}

# Функция для ожидания готовности Redis
wait_for_redis() {
    echo "🔍 Waiting for Redis..."
    while ! nc -z $REDIS_HOST $REDIS_PORT; do
        echo "⏳ Redis is unavailable - sleeping"
        sleep 1
    done
    echo "✅ Redis is ready!"
}

# Проверяем доступность сервисов
if [ "$WAIT_FOR_DB" = "true" ]; then
    wait_for_db
fi

if [ "$WAIT_FOR_REDIS" = "true" ]; then
    wait_for_redis
fi

# Выполняем миграции базы данных
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Собираем статические файлы
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Создаем суперпользователя если нужно
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "👤 Creating superuser..."
    python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD');
    print('✅ Superuser created');
else:
    print('ℹ️ Superuser already exists');
"
fi

# Загружаем начальные данные если это первый запуск
if [ "$LOAD_INITIAL_DATA" = "true" ]; then
    echo "📊 Loading initial data..."
    python manage.py loaddata agencies/fixtures/agencies_data.json || true
    python manage.py loaddata tours/fixtures/tours_data.json || true
    python manage.py loaddata users/fixtures/spheres_specializations.json || true
fi

echo "🚀 Starting application..."
exec "$@"
