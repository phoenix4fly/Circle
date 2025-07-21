import asyncio
import logging
import os
from typing import Optional

from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, BotCommand
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Конфигурация
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://77c013525167.ngrok-free.app')  # URL вашего WebApp
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://127.0.0.1:8001/api/v1')

# Проверяем наличие токена
if not BOT_TOKEN:
    raise ValueError("❌ BOT_TOKEN не установлен!")

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем экземпляры бота и диспетчера
bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()


async def set_bot_commands():
    """Устанавливаем команды бота"""
    commands = [
        BotCommand(command="start", description="🚀 Начать работу с Circle"),
        BotCommand(command="help", description="❓ Помощь"),
        BotCommand(command="profile", description="👤 Мой профиль"),
        BotCommand(command="tours", description="🗺️ Найти туры"),
        BotCommand(command="communities", description="💬 Сообщества"),
    ]
    await bot.set_my_commands(commands)


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Обработчик команды /start"""
    user = message.from_user
    if not user:
        await message.answer("❌ Ошибка получения данных пользователя.")
        return
    
    user_name = user.first_name or "друг"
    
    # Создаем клавиатуру с WebApp кнопкой
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🌍 Открыть Circle",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    kb.add(InlineKeyboardButton(
        text="❓ Как это работает?",
        callback_data="how_it_works"
    ))
    kb.add(InlineKeyboardButton(
        text="🔧 Тест WebApp",
        web_app=WebAppInfo(url=f"{WEBAPP_URL}/telegram-test")
    ))
    kb.adjust(1)  # По одной кнопке в ряд
    
    welcome_text = f"""
🌍 <b>Добро пожаловать в Circle!</b>

Привет, {user_name}! 👋

Circle — это платформа для путешествий с единомышленниками:

✨ <b>Находи попутчиков</b> для любых поездок
🎯 <b>Присоединяйся к сообществам</b> по интересам  
🗺️ <b>Открывай новые туры</b> от проверенных агентств
💬 <b>Общайся</b> с другими путешественниками

<i>Не важно куда. Важно — с кем.</i>

Нажми на кнопку ниже, чтобы начать! 👇
"""
    
    await message.answer(
        welcome_text,
        reply_markup=kb.as_markup()
    )


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Обработчик команды /help"""
    help_text = """
🆘 <b>Помощь по Circle</b>

<b>Основные команды:</b>
/start — Главное меню
/profile — Мой профиль
/tours — Поиск туров
/communities — Мои сообщества

<b>Как работает Circle?</b>

1️⃣ <b>Найди туры</b> — выбирай из сотен направлений
2️⃣ <b>Смотри участников</b> — кто едет с тобой
3️⃣ <b>Общайся в чатах</b> — знакомься до поездки
4️⃣ <b>Путешествуй</b> — получай незабываемые впечатления

<b>Нужна помощь?</b>
Напиши @circle_support или используй /feedback
"""
    
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🌍 Открыть Circle",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    await message.answer(help_text, reply_markup=kb.as_markup())


@dp.message(Command("profile"))
async def cmd_profile(message: types.Message):
    """Обработчик команды /profile"""
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="👤 Открыть профиль",
        web_app=WebAppInfo(url=f"{WEBAPP_URL}/profile")
    ))
    
    await message.answer(
        "👤 <b>Мой профиль</b>\n\nОткрой свой профиль в приложении для редактирования данных и просмотра истории поездок.",
        reply_markup=kb.as_markup()
    )


@dp.message(Command("tours"))
async def cmd_tours(message: types.Message):
    """Обработчик команды /tours"""
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🗺️ Найти туры",
        web_app=WebAppInfo(url=f"{WEBAPP_URL}/tours")
    ))
    
    await message.answer(
        "🗺️ <b>Поиск туров</b>\n\nОткрой каталог туров, чтобы найти идеальное путешествие и познакомиться с попутчиками!",
        reply_markup=kb.as_markup()
    )


@dp.message(Command("communities"))
async def cmd_communities(message: types.Message):
    """Обработчик команды /communities"""
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="💬 Мои сообщества",
        web_app=WebAppInfo(url=f"{WEBAPP_URL}/communities")
    ))
    
    await message.answer(
        "💬 <b>Сообщества</b>\n\nОбщайся с единомышленниками, делись опытом и планируй совместные поездки!",
        reply_markup=kb.as_markup()
    )


@dp.callback_query(lambda c: c.data == "how_it_works")
async def process_how_it_works(callback_query: types.CallbackQuery):
    """Обработчик кнопки 'Как это работает?'"""
    if not callback_query.message or not isinstance(callback_query.message, types.Message):
        await callback_query.answer("❌ Ошибка обработки сообщения")
        return
        
    how_it_works_text = """
🎯 <b>Как работает Circle?</b>

<b>1. Регистрация</b> 📝
Заполни профиль и выбери свои интересы

<b>2. Поиск туров</b> 🔍
Находи туры по направлениям, датам и бюджету

<b>3. Знакомство</b> 👥
Смотри, кто едет в тот же тур, читай профили участников

<b>4. Общение</b> 💬
Общайся в чатах сообществ и конкретных туров

<b>5. Путешествие</b> ✈️
Путешествуй с новыми друзьями!

<b>Почему Circle?</b>
• Безопасность — проверенные агентства
• Единомышленники — фильтр по интересам
• Прозрачность — видишь всех участников
• Удобство — всё в одном приложении
"""
    
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🚀 Попробовать сейчас",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    kb.add(InlineKeyboardButton(
        text="« Назад",
        callback_data="back_to_start"
    ))
    kb.adjust(1)
    
    await callback_query.message.edit_text(
        how_it_works_text,
        reply_markup=kb.as_markup()
    )
    await callback_query.answer()


@dp.callback_query(lambda c: c.data == "back_to_start")
async def process_back_to_start(callback_query: types.CallbackQuery):
    """Возврат к стартовому сообщению"""
    if not callback_query.message or not isinstance(callback_query.message, types.Message):
        await callback_query.answer("❌ Ошибка обработки сообщения")
        return
        
    user = callback_query.from_user
    if not user:
        await callback_query.answer("❌ Ошибка получения данных пользователя")
        return
        
    user_name = user.first_name or "друг"
    
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🌍 Открыть Circle",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    kb.add(InlineKeyboardButton(
        text="❓ Как это работает?",
        callback_data="how_it_works"
    ))
    kb.adjust(1)
    
    welcome_text = f"""
🌍 <b>Добро пожаловать в Circle!</b>

Привет, {user_name}! 👋

Circle — это платформа для путешествий с единомышленниками:

✨ <b>Находи попутчиков</b> для любых поездок
🎯 <b>Присоединяйся к сообществам</b> по интересам  
🗺️ <b>Открывай новые туры</b> от проверенных агентств
💬 <b>Общайся</b> с другими путешественниками

<i>Не важно куда. Важно — с кем.</i>

Нажми на кнопку ниже, чтобы начать! 👇
"""
    
    await callback_query.message.edit_text(
        welcome_text,
        reply_markup=kb.as_markup()
    )
    await callback_query.answer()


@dp.message()
async def handle_any_message(message: types.Message):
    """Обработчик любых других сообщений"""
    kb = InlineKeyboardBuilder()
    kb.add(InlineKeyboardButton(
        text="🌍 Открыть Circle",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    await message.answer(
        "👋 Используй команды бота или открой Circle приложение!",
        reply_markup=kb.as_markup()
    )


async def main():
    """Главная функция запуска бота"""
    try:
        # Устанавливаем команды бота
        await set_bot_commands()
        
        logger.info("🤖 Circle Bot запущен!")
        logger.info(f"📱 WebApp URL: {WEBAPP_URL}")
        
        # Запускаем бота
        await dp.start_polling(bot)
        
    except Exception as e:
        logger.error(f"Ошибка запуска бота: {e}")
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main()) 