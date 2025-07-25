# Multi-stage build для оптимизации размера образа
FROM python:3.11-slim as builder

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создаем virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Устанавливаем runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Копируем virtual environment из builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Создаем пользователя для безопасности
RUN groupadd -r django && useradd -r -g django django

# Создаем директории
WORKDIR /app
RUN mkdir -p /app/logs /app/media /app/static

# Копируем код приложения
COPY . .

# Устанавливаем права
RUN chown -R django:django /app
USER django

# Собираем статические файлы
RUN python manage.py collectstatic --noinput

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health/', timeout=10)"

# Копируем entrypoint скрипт
COPY docker/entrypoint.sh /entrypoint.sh
USER root
RUN chmod +x /entrypoint.sh
USER django

# Expose порт
EXPOSE 8000

# Запуск через entrypoint
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "gevent", "--worker-connections", "1000", "--max-requests", "1000", "--timeout", "120", "circle.wsgi:application"]
