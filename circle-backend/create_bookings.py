#!/usr/bin/env python3
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'circle.settings')
django.setup()

from apps.tours.models import Tour, TourSession
from apps.bookings.models import Booking
from apps.users.models import User
from datetime import datetime, timedelta
import random

# Создаем сессии туров
print("🔧 Создаем сессии туров...")
tours = Tour.objects.all()
for tour in tours:
    if not tour.sessions.exists():
        start_date = datetime.now().date() + timedelta(days=random.randint(7, 30))
        end_date = start_date + timedelta(days=tour.duration_days - 1)
        
        session = TourSession.objects.create(
            tour=tour,
            date_start=start_date,
            date_end=end_date,
            capacity=10,
            available_seats=10,
            is_active=True
        )
        print(f"✅ Сессия для {tour.title}: {start_date}")

# Создаем бронирования
print("🔧 Создаем бронирования...")
users = User.objects.exclude(is_superuser=True)[:10]  # Берем первых 10 пользователей
tours = Tour.objects.all()

for tour in tours:
    session = tour.sessions.first()
    if session:
        # Добавляем 2-3 участника к каждому туру
        selected_users = random.sample(list(users), min(3, len(users)))
        
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
                print(f"📝 {user.first_name} → {tour.title}")

print(f"🎉 Готово! Бронирований: {Booking.objects.count()}") 