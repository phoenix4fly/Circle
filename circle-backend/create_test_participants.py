#!/usr/bin/env python3
"""
Скрипт для создания тестовых участников туров
"""

import os
import django
import random

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'circle.settings')
django.setup()

from apps.users.models import User, Sphere, Specialization
from apps.tours.models import Tour, TourSession
from apps.bookings.models import Booking

def create_test_participants():
    print("🔧 Создаем тестовых участников...")
    
    # Создаем сферы
    sphere_data = [
        ('IT', 'Информационные технологии'),
        ('Бизнес', 'Бизнес и предпринимательство'), 
        ('Медицина', 'Медицина и здравоохранение'),
        ('Образование', 'Образование и наука'),
        ('Творчество', 'Творчество и искусство')
    ]
    
    spheres = {}
    for name, desc in sphere_data:
        sphere, created = Sphere.objects.get_or_create(name=name, defaults={'description': desc})
        spheres[name] = sphere
        if created:
            print(f'✅ Создана сфера: {sphere.name}')
    
    # Создаем специализации
    spec_data = [
        ('Frontend разработчик', 'IT'),
        ('Backend разработчик', 'IT'),
        ('DevOps инженер', 'IT'),
        ('Маркетолог', 'Бизнес'),
        ('Менеджер проектов', 'Бизнес'),
        ('Врач', 'Медицина'),
        ('Дизайнер', 'Творчество'),
        ('Учитель', 'Образование')
    ]
    
    specializations = {}
    for spec_name, sphere_name in spec_data:
        sphere = spheres[sphere_name]
        spec, created = Specialization.objects.get_or_create(
            name=spec_name,
            sphere=sphere,
            defaults={'description': f'Специалист в области {spec_name}'}
        )
        specializations[spec_name] = spec
        if created:
            print(f'✅ Создана специализация: {spec.name}')
    
    # Создаем тестовых пользователей
    test_users = [
        ('Алиса', 'Иванова', 'Frontend разработчик'),
        ('Дмитрий', 'Петров', 'Backend разработчик'),
        ('Мария', 'Сидорова', 'Дизайнер'),
        ('Александр', 'Козлов', 'Маркетолог'),
        ('Елена', 'Федорова', 'Врач'),
        ('Сергей', 'Морозов', 'DevOps инженер'),
        ('Анна', 'Лебедева', 'Учитель'),
        ('Максим', 'Волков', 'Менеджер проектов'),
        ('Ольга', 'Новикова', 'Дизайнер'),
        ('Андрей', 'Соколов', 'Frontend разработчик')
    ]
    
    users_created = []
    for first_name, last_name, spec_name in test_users:
        username = f"{first_name.lower()}.{last_name.lower()}"
        email = f"{username}@example.com"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone_number': f'+998901{random.randint(100000, 999999)}',
                'sphere': specializations[spec_name].sphere,
                'specialization': specializations[spec_name]
            }
        )
        users_created.append(user)
        if created:
            print(f'✅ Создан пользователь: {user.first_name} {user.last_name} ({spec_name})')
    
    # Создаем бронирования для туров
    tours = Tour.objects.all()
    for tour in tours:
        sessions = tour.sessions.all()
        if sessions:
            session = sessions.first()
            
            # Добавляем 2-4 участника к каждому туру
            participants_count = random.randint(2, min(4, len(users_created)))
            selected_users = random.sample(users_created, participants_count)
            
            for user in selected_users:
                booking, created = Booking.objects.get_or_create(
                    user=user,
                    tour=tour,
                    session=session,
                    defaults={
                        'status': 'confirmed',
                        'participants_count': 1,
                        'total_price': session.price
                    }
                )
                if created:
                    print(f'📝 Создано бронирование: {user.first_name} → {tour.title}')
                    
                    # Обновляем количество участников в сессии
                    session.current_participants += 1
                    session.save()
    
    print(f"🎉 Готово!")
    print(f"📊 Создано пользователей: {len(users_created)}")
    print(f"📊 Всего бронирований: {Booking.objects.count()}")
    print(f"📊 Туров с участниками: {Tour.objects.filter(bookings__isnull=False).distinct().count()}")

if __name__ == '__main__':
    create_test_participants() 