#!/usr/bin/env python3
"""
Скрипт для создания тестовых данных туров
"""
import os
import sys
import django

# Настройка Django
sys.path.append('/Users/macbookair/Desktop/CIRCLE/circle-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'circle.settings')
django.setup()

from apps.tours.models import TourCategory, Tour
from apps.agencies.models import TravelAgency
from decimal import Decimal

def create_test_data():
    print("🏗️ Создаем тестовые данные...")
    
    # 1. Категории туров (типы)
    categories = [
        {'name': 'Экскурсионные туры', 'description': 'Познавательные поездки с гидом'},
        {'name': 'Приключенческие туры', 'description': 'Активный отдых и экстрим'},
        {'name': 'Культурные туры', 'description': 'Знакомство с культурой и традициями'},
        {'name': 'Природные туры', 'description': 'Отдых на природе и в горах'},
        {'name': 'Религиозные туры', 'description': 'Паломнические поездки'},
    ]
    
    for cat_data in categories:
        category, created = TourCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        print(f"{'✅ Создано' if created else '📍 Существует'}: {category.name}")
    
    # 2. Создаем тестовое турагентство если нет
    agency, created = TravelAgency.objects.get_or_create(
        name='Test Travel Agency',
        defaults={
            'description': 'Тестовое агентство',
            'email': 'test@travel.com',
            'phone_number': '+998901234567'
        }
    )
    print(f"{'✅ Создано' if created else '📍 Существует'}: {agency.name}")
    
    # 3. Создаем тестовые туры
    tours_data = [
        {
            'title': 'Золотое кольцо Узбекистана',
            'slug': 'golden-ring-uzbekistan',
            'description': 'Классический маршрут по древним городам: Ташкент - Самарканд - Бухара - Хива',
            'type': 'Экскурсионные туры',
            'price_from': Decimal('450000'),
            'base_price': Decimal('500000'),
            'duration_days': 7,
            'duration_nights': 6,
        },
        {
            'title': 'Треккинг в Чимгане',
            'slug': 'chimgan-trekking',
            'description': 'Активный отдых в горах недалеко от Ташкента',
            'type': 'Приключенческие туры',
            'price_from': Decimal('150000'),
            'base_price': Decimal('180000'),
            'duration_days': 2,
            'duration_nights': 1,
        },
        {
            'title': 'Мистическая Бухара',
            'slug': 'mystic-bukhara',
            'description': 'Погружение в атмосферу средневековой Бухары',
            'type': 'Культурные туры',
            'price_from': Decimal('300000'),
            'base_price': Decimal('350000'),
            'duration_days': 3,
            'duration_nights': 2,
        },
        {
            'title': 'Приключения в Хиве',
            'slug': 'khiva-adventure',
            'description': 'Исследование древнего города-крепости',
            'type': 'Экскурсионные туры',
            'price_from': Decimal('280000'),
            'base_price': Decimal('320000'),
            'duration_days': 2,
            'duration_nights': 1,
        },
        {
            'title': 'Горные походы Алматы',
            'slug': 'almaty-mountains',
            'description': 'Знакомство с Алматы и окрестными горами',
            'type': 'Природные туры',
            'price_from': Decimal('380000'),
            'base_price': Decimal('420000'),
            'duration_days': 4,
            'duration_nights': 3,
        },
        {
            'title': 'Выходные в Фергане',
            'slug': 'fergana-weekend',
            'description': 'Короткая поездка в сердце долины',
            'type': 'Культурные туры',
            'price_from': Decimal('120000'),
            'base_price': Decimal('150000'),
            'duration_days': 2,
            'duration_nights': 1,
        },
    ]
    
    for tour_data in tours_data:
        # Находим категорию
        try:
            category = TourCategory.objects.get(name=tour_data['type'])
            
            tour, created = Tour.objects.get_or_create(
                slug=tour_data['slug'],
                defaults={
                    'title': tour_data['title'],
                    'description': tour_data['description'],
                    'type': category,
                    'agency': agency,
                    'price_from': tour_data['price_from'],
                    'base_price': tour_data['base_price'],
                    'duration_days': tour_data['duration_days'],
                    'duration_nights': tour_data['duration_nights'],
                }
            )
            print(f"{'✅ Создан тур' if created else '📍 Тур существует'}: {tour.title}")
            
        except Exception as e:
            print(f"❌ Ошибка создания тура {tour_data['title']}: {e}")
    
    print("\n🎉 Тестовые данные созданы!")
    print(f"📊 Категорий: {TourCategory.objects.count()}")
    print(f"📊 Туров: {Tour.objects.count()}")

if __name__ == '__main__':
    create_test_data() 