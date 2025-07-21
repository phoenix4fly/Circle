#!/usr/bin/env python3
"""
Скрипт для проверки статуса Telegram бота
"""

import os
import asyncio
from aiogram import Bot
from aiogram.exceptions import TelegramUnauthorizedError, TelegramNetworkError

async def check_bot_status():
    """Проверяет статус бота и его настройки"""
    
    # Загружаем переменные окружения
    bot_token = os.getenv('BOT_TOKEN')
    
    print("🔍 Проверка Telegram бота...")
    print("=" * 50)
    
    # Проверяем наличие токена
    if not bot_token:
        print("❌ BOT_TOKEN не найден!")
        print("   Создайте файл .env с токеном от @BotFather")
        return False
    
    print(f"✅ BOT_TOKEN найден: {bot_token[:10]}...")
    
    # Создаем экземпляр бота
    bot = Bot(token=bot_token)
    
    try:
        # Получаем информацию о боте
        me = await bot.get_me()
        print(f"✅ Бот активен: @{me.username}")
        print(f"   Имя: {me.first_name}")
        print(f"   ID: {me.id}")
        
        # Проверяем WebApp домен
        webapp_url = os.getenv('WEBAPP_URL', 'https://77c013525167.ngrok-free.app')
        print(f"🌐 WebApp URL: {webapp_url}")
        
        # Проверяем команды бота
        commands = await bot.get_my_commands()
        print(f"📝 Команды бота: {len(commands)}")
        for cmd in commands:
            print(f"   /{cmd.command} - {cmd.description}")
        
        print("\n✅ Бот работает корректно!")
        print("\n📱 Как протестировать:")
        print(f"   1. Найдите бота @{me.username} в Telegram")
        print("   2. Нажмите /start")
        print("   3. Нажмите кнопку '🌍 Открыть Circle'")
        
        return True
        
    except TelegramUnauthorizedError:
        print("❌ Ошибка авторизации!")
        print("   Токен недействителен. Получите новый от @BotFather")
        return False
        
    except TelegramNetworkError as e:
        print(f"❌ Ошибка сети: {e}")
        print("   Проверьте интернет соединение")
        return False
        
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False
        
    finally:
        await bot.session.close()

if __name__ == "__main__":
    # Загружаем .env файл если есть
    if os.path.exists('.env'):
        print("📄 Загружаем .env файл...")
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    # Запускаем проверку
    asyncio.run(check_bot_status()) 