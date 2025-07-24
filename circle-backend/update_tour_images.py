#!/usr/bin/env python3
"""
Скрипт для обновления изображений туров
Использование: python3 update_tour_images.py
"""

import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'circle.settings')
django.setup()

from apps.media.models import Media
from apps.tours.models import Tour

def update_tour_images():
    print("🔧 Обновляем изображения туров...")
    
    # Проверяем есть ли файл sample.jpg
    image_path = 'tour_images/sample.jpg'
    full_path = f'media/{image_path}'
    
    if not os.path.exists(full_path):
        print(f"❌ Файл {full_path} не найден!")
        print(f"📁 Поместите изображение в: {os.path.abspath(full_path)}")
        return
    
    # Создаем или получаем Media объект
    media, created = Media.objects.get_or_create(
        file=image_path,
        defaults={
            'title': 'Тестовое изображение тура',
            'media_type': 'image',
            'description': 'Красивое изображение для демонстрации туров'
        }
    )
    
    if created:
        print(f"✅ Создан новый Media объект: {media.title}")
    else:
        print(f"✅ Используем существующий Media объект: {media.title}")
    
    # Обновляем все туры без изображений
    tours_updated = 0
    tours = Tour.objects.filter(main_image__isnull=True)
    
    for tour in tours:
        tour.main_image = media
        tour.save()
        tours_updated += 1
        print(f"📸 Обновлен тур: {tour.title}")
    
    if tours_updated == 0:
        print("ℹ️  Все туры уже имеют изображения")
    else:
        print(f"🎉 Обновлено туров: {tours_updated}")
    
    print(f"📊 Общее количество туров: {Tour.objects.count()}")
    print(f"📸 Туров с изображениями: {Tour.objects.filter(main_image__isnull=False).count()}")

if __name__ == '__main__':
    update_tour_images() 