'use client';

import React, { useEffect, useState } from 'react';
import { TelegramUtils } from '@/lib/telegram';

export default function TelegramTestPage() {
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ждем загрузки Telegram WebApp
    const timer = setTimeout(() => {
      const data = {
        isAvailable: TelegramUtils.isAvailable(),
        isInTelegram: TelegramUtils.isInTelegram(),
        initData: TelegramUtils.getInitData(),
        user: TelegramUtils.getUser(),
        version: TelegramUtils.getVersion(),
        platform: TelegramUtils.getPlatform(),
        webApp: TelegramUtils.getWebApp(),
        windowTelegram: typeof window !== 'undefined' ? !!window.Telegram : false,
      };
      
      setTelegramData(data);
      setIsLoaded(true);
      
      // Инициализируем WebApp
      if (data.isAvailable) {
        TelegramUtils.ready();
        TelegramUtils.setupTheme();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем Telegram WebApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Telegram WebApp Test</h1>
          
          {/* Статус */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${
                telegramData?.isInTelegram ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="font-medium">
                {telegramData?.isInTelegram ? 'Запущено в Telegram ✅' : 'НЕ в Telegram ❌'}
              </span>
            </div>
            
            {!telegramData?.isInTelegram && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ WebApp открыт неправильно!</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Для получения данных авторизации WebApp должен быть открыт через Telegram клиент, а не напрямую в браузере.
                </p>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Правильно:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Откройте вашего Telegram бота</li>
                    <li>Нажмите /start</li>
                    <li>Нажмите кнопку &quot;🌍 Открыть Circle&quot;</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Детальная информация */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Основная информация</h3>
              <div className="text-sm space-y-1">
                <div><strong>WebApp доступен:</strong> {telegramData?.isAvailable ? '✅ Да' : '❌ Нет'}</div>
                <div><strong>window.Telegram:</strong> {telegramData?.windowTelegram ? '✅ Да' : '❌ Нет'}</div>
                <div><strong>В Telegram:</strong> {telegramData?.isInTelegram ? '✅ Да' : '❌ Нет'}</div>
                <div><strong>Версия:</strong> {telegramData?.version || 'неизвестна'}</div>
                <div><strong>Платформа:</strong> {telegramData?.platform || 'неизвестна'}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">initData</h3>
              <div className="text-sm space-y-1">
                <div><strong>Длина:</strong> {telegramData?.initData?.length || 0} символов</div>
                <div><strong>Содержит hash:</strong> {telegramData?.initData?.includes('hash=') ? '✅ Да' : '❌ Нет'}</div>
                {telegramData?.initData ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Показать данные</summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs break-all">
                      {telegramData.initData}
                    </div>
                  </details>
                ) : (
                  <div className="text-red-600 font-medium">initData пустые!</div>
                )}
              </div>
            </div>

            {telegramData?.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Пользователь</h3>
                <div className="text-sm space-y-1">
                  <div><strong>ID:</strong> {telegramData.user.id}</div>
                  <div><strong>Имя:</strong> {telegramData.user.first_name}</div>
                  <div><strong>Фамилия:</strong> {telegramData.user.last_name || 'не указана'}</div>
                  <div><strong>Username:</strong> {telegramData.user.username || 'не указан'}</div>
                  <div><strong>Язык:</strong> {telegramData.user.language_code || 'не указан'}</div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">WebApp объект</h3>
              <details>
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Показать полные данные</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(telegramData?.webApp, null, 2)}
                </pre>
              </details>
            </div>
          </div>

          {/* Действия */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Обновить
            </button>
            
            {/* Fallback для тестирования в development */}
            {!telegramData?.isInTelegram && process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  // Создаем тестовые initData для разработки
                  const testInitData = "query_id=test123&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1640995200&hash=test_hash_for_development";
                  
                  // Сохраняем в localStorage для тестирования
                  localStorage.setItem('test_telegram_data', testInitData);
                  alert('Тестовые данные созданы! Теперь можете протестировать авторизацию.');
                  window.location.href = '/auth';
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                🧪 Создать тестовые данные (DEV)
              </button>
            )}
            
            {telegramData?.isInTelegram && (
              <button
                onClick={() => {
                  TelegramUtils.vibrate('light');
                  alert('Тест вибрации выполнен!');
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                📳 Тест вибрации
              </button>
            )}
            
            <a
              href="/auth"
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center"
            >
              ← Назад к авторизации
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 