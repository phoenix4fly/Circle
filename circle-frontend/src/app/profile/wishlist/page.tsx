'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon,
  ArrowLeftIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useWishlist } from '@/hooks/useWishlist';
import TourCard from '@/components/Tour/TourCard';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useTelegramAuth();
  const { 
    wishlist, 
    count, 
    isLoading: wishlistLoading, 
    error: wishlistError,
    fetchWishlist,
    clearWishlist 
  } = useWishlist();

  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleClearWishlist = async () => {
    if (confirm(`Удалить все ${count} запланированных туров?`)) {
      const success = await clearWishlist();
      if (success) {
        // Возможно показать toast успеха
        console.log('✅ Wishlist cleared successfully');
      }
    }
  };

  const handleRefresh = () => {
    fetchWishlist();
  };

  // Показываем загрузку
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-helvetica px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg animate-pulse">
            <HeartSolidIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2 font-helvetica">Запланированные туры</h1>
          <p className="text-gray-600 text-xs font-helvetica">Загружаем...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.back()}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-2">
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                <h1 className="text-lg font-semibold text-gray-900 font-helvetica">
                  Мои планы
                </h1>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                  {count}
                </span>
              </div>
            </div>

            {/* Действия */}
            {count > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  title="Обновить"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <button
                  onClick={handleClearWishlist}
                  className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                  title="Очистить все"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="px-4 py-6">
        {wishlistLoading ? (
          /* Загрузка */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlistError ? (
          /* Ошибка */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 font-helvetica">Ошибка загрузки</h3>
            <p className="text-red-600 text-sm mb-4 font-helvetica">{wishlistError}</p>
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-helvetica"
            >
              Попробовать снова
            </button>
          </div>
        ) : count === 0 ? (
          /* Пустой wishlist */
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 font-helvetica">Пока пусто</h3>
            <p className="text-gray-500 text-sm mb-6 font-helvetica max-w-xs mx-auto">
              Добавляйте понравившиеся туры в планы, нажимая на ❤️ в карточках туров
            </p>
            <button
              onClick={() => router.push('/tours')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-helvetica"
            >
              Посмотреть туры
            </button>
          </div>
        ) : (
          /* Список туров */
          <div className="space-y-4">
            {/* Сортировка/фильтры */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-helvetica">Сортировка:</span>
                  <select className="text-sm text-gray-900 bg-transparent font-helvetica">
                    <option>Недавно добавленные</option>
                    <option>По цене</option>
                    <option>По продолжительности</option>
                    <option>По названию</option>
                  </select>
                </div>
                
                <span className="text-xs text-gray-500 font-helvetica">
                  {count} {count === 1 ? 'тур' : count < 5 ? 'тура' : 'туров'}
                </span>
              </div>
            </div>

            {/* Сетка туров */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {/* Дополнительная информация */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm font-helvetica">Планируйте заранее!</h4>
                  <p className="text-blue-700 text-xs font-helvetica">
                    Сохраняйте интересные туры в планы, чтобы не потерять. Мы уведомим о скидках и новых датах!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 