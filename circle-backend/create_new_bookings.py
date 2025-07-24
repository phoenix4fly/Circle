#!/usr/bin/env python3
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'circle.settings')
django.setup()

from apps.tours.models import Tour
from apps.bookings.models import Booking
from apps.users.models import User
import random

print("🔧 Создаем бронирования с новыми пользователями...")

# Берем только пользователей у которых есть сферы
users_with_spheres = User.objects.filter(
    sphere__isnull=False, 
    specialization__isnull=False
).exclude(is_superuser=True)

print(f"Найдено пользователей с сферами: {users_with_spheres.count()}")

tours = Tour.objects.all()
for tour in tours:
    session = tour.sessions.first()
    if session and users_with_spheres.exists():
        # Добавляем 2-3 участника к каждому туру
        selected_users = random.sample(list(users_with_spheres), min(3, users_with_spheres.count()))
        
        for user in selected_users:
            booking, created = Booking.objects.get_or_create(
                user=user,
                tour=tour,
                session=session,
                defaults={
                    'status': 'paid',
                    'seats_reserved': 1,
                    'base_price': session.price_override or tour.price_from,
                    'final_price_paid': session.price_override or tour.price_from
                }
            )
            if created:
                print(f"📝 {user.first_name} ({user.specialization.name}) → {tour.title}")

print(f"🎉 Готово! Бронирований: {Booking.objects.count()}") 