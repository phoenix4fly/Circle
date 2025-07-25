# Используем тот же образ что и для backend
FROM python:3.11-slim

# Устанавливаем runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя для безопасности
RUN groupadd -r celery && useradd -r -g celery celery

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Создаем директории для логов
RUN mkdir -p /app/logs && chown -R celery:celery /app

# Переключаемся на пользователя celery
USER celery

# Health check для Celery worker
HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 \
    CMD celery -A circle inspect ping --timeout=10

# Копируем entrypoint скрипт
COPY docker/entrypoint.sh /entrypoint.sh
USER root
RUN chmod +x /entrypoint.sh
USER celery

# Запуск Celery worker
ENTRYPOINT ["/entrypoint.sh"]
CMD ["celery", "-A", "circle", "worker", "--loglevel=info", "--concurrency=4", "--max-tasks-per-child=1000"]
