import { useState, useEffect } from 'react';
import { wishlistApi, WishlistResponse, WishlistToggleResponse } from '@/lib/api';

// Хук для toggle wishlist конкретного тура
export const useWishlistToggle = (tourId: number, initialIsWishlisted: boolean = false) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleWishlist = async (): Promise<boolean> => {
    if (isLoading) return isWishlisted;

    setIsLoading(true);
    setError(null);

    try {
      const response: WishlistToggleResponse = await wishlistApi.toggleWishlist(tourId);
      
      setIsWishlisted(response.is_wishlisted);
      
      // Уведомление об успехе
      console.log(`✅ ${response.message}`);
      
      return response.is_wishlisted;
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при обновлении планов';
      setError(errorMessage);
      console.error('❌ Wishlist toggle error:', err);
      
      // В случае ошибки не меняем состояние
      return isWishlisted;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (): Promise<boolean> => {
    if (isLoading || !isWishlisted) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response: WishlistToggleResponse = await wishlistApi.removeFromWishlist(tourId);
      
      setIsWishlisted(false);
      
      console.log(`✅ ${response.message}`);
      
      return false;
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при удалении из планов';
      setError(errorMessage);
      console.error('❌ Remove from wishlist error:', err);
      
      return isWishlisted;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isWishlisted,
    isLoading,
    error,
    toggleWishlist,
    removeFromWishlist,
    // Для внешнего обновления состояния
    setIsWishlisted
  };
};

// Хук для получения всего wishlist пользователя
export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistResponse>({ count: 0, results: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await wishlistApi.getWishlist();
      setWishlist(response);
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при загрузке планов';
      setError(errorMessage);
      console.error('❌ Fetch wishlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.clearWishlist();
      
      setWishlist({ count: 0, results: [] });
      
      console.log(`✅ ${response.message}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при очистке планов';
      setError(errorMessage);
      console.error('❌ Clear wishlist error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновить конкретный тур в wishlist (например после toggle)
  const updateTourInWishlist = (tourId: number, isWishlisted: boolean) => {
    if (isWishlisted) {
      // Если тур добавлен, нужно перезагрузить wishlist
      // так как у нас может не быть полной информации о туре
      fetchWishlist();
    } else {
      // Если тур удален, просто убираем его из списка
      setWishlist(prev => ({
        count: prev.count - 1,
        results: prev.results.filter(tour => tour.id !== tourId)
      }));
    }
  };

  // Загружаем wishlist при монтировании
  useEffect(() => {
    fetchWishlist();
  }, []);

  return {
    wishlist: wishlist.results,
    count: wishlist.count,
    isLoading,
    error,
    fetchWishlist,
    clearWishlist,
    updateTourInWishlist
  };
};

// Хук для быстрой проверки статуса wishlist
export const useIsWishlisted = (tourId: number): boolean => {
  const { wishlist } = useWishlist();
  return wishlist.some(tour => tour.id === tourId);
}; 