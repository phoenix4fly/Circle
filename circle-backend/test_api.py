#!/usr/bin/env python3
"""
Тестовый скрипт для проверки всех API endpoints Circle
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(endpoint, description):
    """Тестирует API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.get(url, timeout=5)
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} {description}")
        print(f"   URL: {url}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict):
                    if 'results' in data:
                        print(f"   Count: {data.get('count', 'N/A')}")
                    elif 'id' in data:
                        print(f"   ID: {data['id']}")
                elif isinstance(data, list):
                    print(f"   Items: {len(data)}")
            except:
                print(f"   Response length: {len(response.text)} chars")
        else:
            print(f"   Error: {response.text[:100]}")
        print()
        return response.status_code == 200
    except Exception as e:
        print(f"❌ {description}")
        print(f"   URL: {url}")
        print(f"   Error: {e}")
        print()
        return False

def main():
    print("🧪 Тестирование Circle API endpoints")
    print("=" * 50)
    print(f"Время тестирования: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Список всех endpoints для тестирования
    endpoints = [
        # Users
        ("/users/spheres/", "👥 Сферы деятельности"),
        ("/users/specializations/", "💼 Специализации"),
        
        # Tours  
        ("/tours/tours/", "🗺️ Список туров"),
        ("/tours/categories/", "📂 Категории туров"),
        ("/tours/tours/1/", "🎯 Детали тура #1"),
        
        # Agencies
        ("/agencies/agencies/", "🏢 Турагентства"),
        
        # Media
        ("/media/media/", "📸 Медиафайлы"),
        
        # Bookings (требует авторизации)
        # ("/bookings/bookings/", "📋 Бронирования"),
        
        # Payments (требует авторизации)
        # ("/payments/transactions/", "💳 Платежи"),
        
        # Referrals (требует авторизации)
        # ("/referrals/partners/", "🤝 Реферальные партнеры"),
        
        # Core (требует admin прав)
        # ("/core/configs/", "⚙️ Системные настройки"),
    ]

    success_count = 0
    total_count = len(endpoints)

    for endpoint, description in endpoints:
        if test_endpoint(endpoint, description):
            success_count += 1

    print("📊 Результаты тестирования:")
    print(f"   Успешно: {success_count}/{total_count}")
    print(f"   Процент успеха: {success_count/total_count*100:.1f}%")
    
    if success_count == total_count:
        print("\n🎉 Все API endpoints работают корректно!")
    else:
        print(f"\n⚠️ {total_count - success_count} endpoints требуют внимания")

    print("\n🔗 Полезные ссылки:")
    print("   • Django Admin: http://127.0.0.1:8000/admin/")
    print("   • API Documentation: http://127.0.0.1:8000/swagger/")
    print("   • Tours API: http://127.0.0.1:8000/api/v1/tours/tours/")
    print("   • Spheres API: http://127.0.0.1:8000/api/v1/users/spheres/")

if __name__ == "__main__":
    main() 