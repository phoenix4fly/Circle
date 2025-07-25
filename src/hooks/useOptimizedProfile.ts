import { useMemo, useCallback } from 'react';
import { useTelegramAuth } from './useTelegramAuth';
import { useWishlist } from './useWishlist';

export const useOptimizedProfile = () => {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useTelegramAuth();
  const { wishlist, count, isLoading: wishlistLoading, error: wishlistError } = useWishlist();

  // Мемоизируем пользователя для избежания лишних рендеров
  const memoizedUser = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      last_online: user.last_online,
      sphere: user.sphere,
      // Добавляем только нужные поля
    };
  }, [user?.id, user?.first_name, user?.last_name, user?.username, user?.last_online, user?.sphere]);

  // Мемоизируем статус онлайн для избежания пересчетов
  const onlineStatus = useMemo(() => {
    if (!memoizedUser?.last_online) return 'недавно';
    
    const lastOnline = new Date(memoizedUser.last_online);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastOnline.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'сейчас онлайн';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return lastOnline.toLocaleDateString('ru-RU');
  }, [memoizedUser?.last_online]);

  // Мемоизируем список желаемого
  const memoizedWishlist = useMemo(() => {
    if (!wishlist) return [];
    
    // Возвращаем только первые 6 элементов для профиля
    return wishlist.slice(0, 6).map(tour => ({
      id: tour.id,
      title: tour.title,
      main_image: tour.main_image,
      category: tour.category,
      price_from: tour.price_from,
      // Только нужные поля
    }));
  }, [wishlist]);

  // Мемоизируем инициалы
  const userInitials = useMemo(() => {
    if (!memoizedUser?.first_name && !memoizedUser?.last_name) return 'U';
    
    const firstName = memoizedUser.first_name || '';
    const lastName = memoizedUser.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }, [memoizedUser?.first_name, memoizedUser?.last_name]);

  // Оптимизированная функция форматирования цены
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return price.toString();
  }, []);

  // Общее состояние загрузки
  const isLoading = authLoading || wishlistLoading;

  // Проверка ошибок
  const hasError = wishlistError;

  return {
    // Данные
    user: memoizedUser,
    wishlist: memoizedWishlist,
    wishlistCount: count,
    onlineStatus,
    userInitials,

    // Состояния
    isLoading,
    isAuthenticated,
    hasError,

    // Утилиты
    formatPrice,
    logout,
  };
}; 