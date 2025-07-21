'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus('loading');
    setApiError(null);
    setApiResponse(null);

    try {
      console.log('Проверяем API:', API_BASE_URL);
      
      // Проверяем health check
      const healthResponse = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        
        // Дополнительно проверяем Telegram auth endpoint
        const telegramResponse = await fetch(`${API_BASE_URL}/auth/telegram/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ init_data: 'test' }) // Тестовый запрос
        });
        
        const result = {
          health_check: healthData,
          telegram_auth_available: telegramResponse.status !== 404,
          telegram_status: telegramResponse.status,
          telegram_error: telegramResponse.status >= 400 ? await telegramResponse.text() : null
        };
        
        setApiResponse(result);
        setApiStatus('success');
      } else {
        setApiError(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
        setApiStatus('error');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      setApiError(error.message || 'Network error');
      setApiStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 Диагностика Circle</h1>
          
          {/* API статус */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Backend API статус</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">API URL:</p>
              <code className="text-sm bg-gray-200 px-2 py-1 rounded">{API_BASE_URL}</code>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
                apiStatus === 'success' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="font-medium">
                {apiStatus === 'loading' ? 'Проверяем...' :
                 apiStatus === 'success' ? 'Подключение успешно ✅' : 'Ошибка подключения ❌'}
              </span>
            </div>

            {apiStatus === 'success' && apiResponse && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Ответ сервера:</h3>
                <pre className="text-sm text-green-700 overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {apiStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Ошибка:</h3>
                <p className="text-sm text-red-700">{apiError}</p>
                
                <div className="mt-4 text-sm text-red-600">
                  <p className="font-medium mb-2">Возможные причины:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Backend сервер не запущен</li>
                    <li>Неправильный URL или порт</li>
                    <li>CORS ошибки</li>
                    <li>Проблемы с сетью</li>
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={checkApiStatus}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Проверить снова
            </button>
          </div>

          {/* Инструкции */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📖 Как запустить backend</h2>
            
                         <div className="bg-gray-50 rounded-lg p-4 space-y-3">
               <div>
                 <p className="font-medium text-gray-700 mb-1">1. Перейдите в папку backend:</p>
                 <code className="text-sm bg-gray-200 px-2 py-1 rounded block">cd circle-backend</code>
               </div>
               
               <div>
                 <p className="font-medium text-gray-700 mb-1">2. Создайте .env файл с вашим BOT_TOKEN:</p>
                 <code className="text-sm bg-gray-200 px-2 py-1 rounded block">
                   BOT_TOKEN=ваш_токен_от_BotFather<br/>
                   SECRET_KEY=ваш_секретный_ключ<br/>
                   DEBUG=True
                 </code>
               </div>
               
               <div>
                 <p className="font-medium text-gray-700 mb-1">3. Установите зависимости:</p>
                 <code className="text-sm bg-gray-200 px-2 py-1 rounded block">pip install -r requirements.txt</code>
               </div>
               
               <div>
                 <p className="font-medium text-gray-700 mb-1">4. Примените миграции:</p>
                 <code className="text-sm bg-gray-200 px-2 py-1 rounded block">python manage.py migrate</code>
               </div>
               
               <div>
                 <p className="font-medium text-gray-700 mb-1">5. Запустите сервер:</p>
                 <code className="text-sm bg-gray-200 px-2 py-1 rounded block">python manage.py runserver 0.0.0.0:8001</code>
               </div>
             </div>
          </div>

          {/* Ссылки */}
          <div className="border-t pt-6 mt-6">
            <div className="flex space-x-4">
              <a 
                href="/" 
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                ← Вернуться на главную
              </a>
              <a 
                href="/auth" 
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Страница входа →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 