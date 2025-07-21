import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramUtils } from '@/lib/telegram';
import { apiClient, tokenUtils, type User, type AuthResponse } from '@/lib/api';

interface TelegramAuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  isInTelegram: boolean;
}

interface TelegramAuthActions {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTelegramAuth(): TelegramAuthState & TelegramAuthActions {
  const router = useRouter();
  const [state, setState] = useState<TelegramAuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
    isInTelegram: false,
  });

  // Проверка начальной аутентификации
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInTelegram = TelegramUtils.isInTelegram();
      setState(prev => ({ ...prev, isInTelegram }));

      if (isInTelegram) {
        // Инициализируем WebApp
        TelegramUtils.ready();
        TelegramUtils.setupTheme();
        
        // Если еще не аутентифицированы и есть initData, пытаемся войти
        if (!tokenUtils.isAuthenticated() && TelegramUtils.getInitData()) {
          login();
        }
      }
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Проверяем наличие токенов
      if (!tokenUtils.isAuthenticated()) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null
        }));
        return;
      }

      // Пытаемся получить данные пользователя
      const user = await apiClient.getMe();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user,
        error: null
      }));

    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      
      // Токены невалидны, очищаем их
      tokenUtils.removeTokens();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: 'Сессия истекла'
      }));
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Получаем initData от Telegram
      const initData = TelegramUtils.getInitData();
      
      console.log('🔍 Telegram Debug Info:');
      console.log('- isInTelegram:', TelegramUtils.isInTelegram());
      console.log('- initData length:', initData?.length || 0);
      console.log('- initData:', initData ? initData.substring(0, 100) + '...' : 'empty');
      console.log('- WebApp available:', TelegramUtils.isAvailable());
      console.log('- User data:', TelegramUtils.getUser());
      
      if (!initData || initData.length < 10) {
        throw new Error('Данные Telegram недоступны или некорректны');
      }

      // Отправляем запрос на аутентификацию
      console.log('📤 Отправляем Telegram авторизацию...');
      const response: AuthResponse = await apiClient.telegramAuth(initData);
      
      // Сохраняем токены и пользователя
      tokenUtils.setTokens(response.tokens);
      tokenUtils.setUser(response.user);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
        error: null
      }));

      // Показываем успешное уведомление
      TelegramUtils.vibrate('success');

      // Перенаправляем на onboarding если нужно
      if (response.onboarding_required) {
        if (!response.user.sphere_selected) {
          router.push('/onboarding/sphere');
        } else if (!response.user.preferences_selected) {
          router.push('/onboarding/preferences');
        }
      }

      console.log('Успешная аутентификация через Telegram:', response.user.username);

    } catch (error: any) {
      console.error('Ошибка Telegram аутентификации:', error);
      
      let errorMessage = 'Ошибка аутентификации';
      
      // Обрабатываем разные типы ошибок
      if (error.message?.includes('fetch')) {
        errorMessage = 'Не удается подключиться к серверу. Проверьте интернет соединение.';
      } else if (error.message?.includes('Load failed')) {
        errorMessage = 'Сервер недоступен. Попробуйте позже.';
      } else if (error.message?.includes('NetworkError')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      // Не используем Telegram popup чтобы избежать конфликтов
      TelegramUtils.vibrate('error');
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const tokens = tokenUtils.getTokens();
      if (tokens?.refresh) {
        try {
          await apiClient.logout(tokens.refresh);
        } catch (error) {
          console.warn('Ошибка при выходе через API:', error);
        }
      }

      // Очищаем локальные данные
      tokenUtils.removeTokens();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      }));

      // Показываем уведомление
      TelegramUtils.vibrate('light');

      // Перенаправляем на страницу авторизации
      router.push('/auth');

    } catch (error) {
      console.error('Ошибка выхода:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const tokens = tokenUtils.getTokens();
      if (!tokens?.refresh) {
        throw new Error('Refresh токен отсутствует');
      }

      const newTokens = await apiClient.refreshToken(tokens.refresh);
      tokenUtils.setTokens(newTokens);

      // Обновляем данные пользователя
      const user = await apiClient.getMe();
      tokenUtils.setUser(user);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null
      }));

    } catch (error) {
      console.error('Ошибка обновления токенов:', error);
      
      // Токены невалидны, выходим
      tokenUtils.removeTokens();
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        error: 'Сессия истекла'
      }));
      
      router.push('/auth');
    }
  }, [router]);

  return {
    ...state,
    login,
    logout,
    refresh
  };
} 