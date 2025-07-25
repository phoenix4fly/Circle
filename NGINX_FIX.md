# Исправление Nginx для standalone режима Next.js

## Проблема
В standalone режиме Next.js сам обслуживает статические файлы `/_next/static/`, но Nginx может их перехватывать, что вызывает 404 ошибки.

## Решение

### 1. Отредактировать конфиг Nginx:
```bash
nano /etc/nginx/sites-available/circle
```

### 2. Закомментировать location для /static/ и /media/:

**Найти эти блоки:**
```nginx
# Static files
location /static/ {
    alias /var/www/circle/circle-backend/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Media files
location /media/ {
    alias /var/www/circle/circle-backend/media/;
    expires 1M;
    add_header Cache-Control "public";
}
```

**Закомментировать (добавить # в начало каждой строки):**
```nginx
# Static files
# location /static/ {
#     alias /var/www/circle/circle-backend/static/;
#     expires 1y;
#     add_header Cache-Control "public, immutable";
# }

# Media files  
# location /media/ {
#     alias /var/www/circle/circle-backend/media/;
#     expires 1M;
#     add_header Cache-Control "public";
# }
```

### 3. Перезагрузить Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Очистить кэш браузера:
- Ctrl+Shift+R (жесткое обновление)
- Или F12 → Application → Storage → Clear site data 