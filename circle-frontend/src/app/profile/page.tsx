'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useWishlist } from '@/hooks/useWishlist';
import TourCard from '@/components/Tour/TourCard';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileHeaderSkeleton from '@/components/Profile/ProfileHeaderSkeleton';

// Мемоизированный компонент для загрузки
const ProfileSkeleton = React.memo(() => (
  <div className="min-h-screen bg-gray-50 pb-20">
    <ProfileHeaderSkeleton />
    
    {/* Скелетон для остального контента */}
    <div className="px-4 py-6 space-y-6">
      {/* Скелетон wishlist секции */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-6 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-3 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
      </div>
      
      {/* Скелетон "Мой круг" */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-6 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="min-w-[60px] text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Скелетон других секций */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

ProfileSkeleton.displayName = 'ProfileSkeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useTelegramAuth();
  const { wishlist, count, isLoading: wishlistLoading, error: wishlistError } = useWishlist();

  // Мемоизированные функции для навигации и действий
  const handleEditProfile = useCallback(() => {
    router.push('/profile/edit/');
  }, [router]);

  const handleChangeAvatar = useCallback(() => {
    console.log('Изменение аватара - функциональность будет добавлена');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }, [logout, router]);

  // Мемоизируем форматирование цены
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000) {
      return (price / 1000).toFixed(0) + 'k';
    }
    return price.toString();
  }, []);

  // Мемоизируем данные пользователя для избежания лишних пересчетов
  const memoizedUser = useMemo(() => user, [user?.id, user?.first_name, user?.last_name, user?.username, user?.last_online]);

  // Мемоизируем список желаемого
  const memoizedWishlist = useMemo(() => wishlist, [wishlist]);

  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  // Показываем загрузку
  if (authLoading || !memoizedUser) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Новый современный хедер */}
      <ProfileHeader 
        user={memoizedUser}
        isOwnProfile={true}
        onEditProfile={handleEditProfile}
        onChangeAvatar={handleChangeAvatar}
      />

      {/* Запланированные туры */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 rounded-2xl shadow-lg shadow-red-500/5 border border-white/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                <HeartIcon className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Запланированные туры
              </h2>
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-lg shadow-red-500/20">
                {count}
              </span>
            </div>
            
            {count > 0 && (
              <button 
                onClick={() => router.push('/tours/')}
                className="text-red-600 text-xs font-medium hover:text-red-700 tracking-wide"
              >
                Все туры →
              </button>
            )}
          </div>

          {/* Контент wishlist */}
          {wishlistLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <HeartIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-helvetica">Загружаем планы...</p>
            </div>
          ) : wishlistError ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HeartIcon className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-600 text-sm font-helvetica">Ошибка загрузки планов</p>
              <p className="text-gray-500 text-xs font-helvetica mt-1">{wishlistError}</p>
            </div>
          ) : count === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gray-500/10">
                <HeartIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 text-sm tracking-tight">Пока пусто</h3>
              <p className="text-gray-500 text-xs mb-4 tracking-wide leading-relaxed">
                Добавляйте понравившиеся туры в планы ❤️
              </p>
              <button
                onClick={() => router.push('/tours/')}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-2xl font-semibold text-xs hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/20"
              >
                Смотреть туры
              </button>
            </div>
          ) : (
            <>
              {/* Горизонтальный скролл с турами */}
              <div className="flex overflow-x-auto space-x-3 pb-2 -mx-1">
                {memoizedWishlist.slice(0, 6).map((tour) => (
                  <div key={tour.id} className="min-w-[140px] max-w-[140px] flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                      {/* Мини изображение */}
                      <div className="h-20 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
                        {tour.main_image?.url ? (
                          <img 
                            src={tour.main_image.url} 
                            alt={tour.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-xs">🏛️</span>
                          </div>
                        )}
                        <div className="absolute top-1 right-1">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">❤️</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Мини информация */}
                      <div className="p-2.5">
                        <h4 className="text-xs font-medium text-gray-900 truncate leading-tight">
                          {tour.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {tour.category?.name || 'Путешествие'}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-orange-600">
                            {tour.price_from ? (
                              tour.price_from >= 1000 
                                ? `${Math.floor(tour.price_from / 1000)}к` 
                                : `${tour.price_from}`
                            ) : 'Цена по запросу'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {tour.duration_days}д
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {count > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/profile/wishlist')}
                    className="text-orange-500 text-sm font-medium hover:text-orange-600 font-helvetica"
                  >
                    Показать все {count} туров →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Мой круг */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/20 rounded-2xl shadow-lg shadow-orange-500/5 border border-white/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xs">👥</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Мой круг
              </h2>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-lg shadow-orange-500/20">
                12
              </span>
            </div>
            <button className="text-orange-600 text-xs font-medium hover:text-red-600 tracking-wide">
              Все →
            </button>
          </div>

          {/* Список связей */}
          {/* 
            TODO: В будущем заменить на динамические данные с API
            Функция для случайных градиентов:
            const avatarGradients = [
              'from-pink-500 to-rose-500',
              'from-blue-500 to-cyan-500', 
              'from-purple-500 to-violet-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-amber-500',
              'from-indigo-500 to-blue-600',
              'from-teal-500 to-cyan-600',
              'from-red-500 to-pink-600',
              'from-yellow-500 to-orange-500',
              'from-violet-500 to-purple-600'
            ];
            const getRandomGradient = (userId) => avatarGradients[userId % avatarGradients.length];
          */}
          <div className="flex overflow-x-auto space-x-2.5 pb-2 -mx-1">
            {[
              { id: 1, name: 'Анна К.', avatar: 'АК', status: 'онлайн', gradient: 'from-pink-500 to-rose-500' },
              { id: 2, name: 'Максим Р.', avatar: 'МР', status: '2 ч назад', gradient: 'from-blue-500 to-cyan-500' },
              { id: 3, name: 'София Н.', avatar: 'СН', status: 'вчера', gradient: 'from-purple-500 to-violet-500' },
              { id: 4, name: 'Даниил М.', avatar: 'ДМ', status: 'онлайн', gradient: 'from-green-500 to-emerald-500' },
              { id: 5, name: 'Елена В.', avatar: 'ЕВ', status: '1 дн назад', gradient: 'from-orange-500 to-amber-500' },
              { id: 6, name: 'Артем С.', avatar: 'АС', status: '3 ч назад', gradient: 'from-indigo-500 to-blue-600' },
              { id: 7, name: 'Мария Т.', avatar: 'МТ', status: 'онлайн', gradient: 'from-teal-500 to-cyan-600' },
              { id: 8, name: 'Олег К.', avatar: 'ОК', status: '5 мин назад', gradient: 'from-red-500 to-pink-600' }
            ].map((contact) => (
              <div key={contact.id} className="min-w-[70px] flex-shrink-0 text-center">
                <div className="relative mb-1.5">
                  <div className={`w-11 h-11 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 ring-2 ring-white/50`}>
                    <span className="text-white font-semibold text-xs tracking-tight">{contact.avatar}</span>
                  </div>
                  {contact.status === 'онлайн' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 truncate leading-tight">{contact.name}</p>
                <p className="text-xs text-gray-400 truncate leading-tight">{contact.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* История путешествий */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/20 rounded-2xl shadow-lg shadow-orange-500/5 border border-white/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xs">🗺️</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Мои путешествия
              </h2>
            </div>
            <button className="text-orange-600 text-xs font-medium hover:text-red-600 tracking-wide">
              Все →
            </button>
          </div>

          {/* Статистика путешествий */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center bg-white/60 rounded-xl py-2 backdrop-blur-sm border border-white/40">
              <p className="text-lg font-bold text-green-600 leading-tight">3</p>
              <p className="text-xs text-gray-600 tracking-wide">Завершено</p>
            </div>
            <div className="text-center bg-white/60 rounded-xl py-2 backdrop-blur-sm border border-white/40">
              <p className="text-lg font-bold text-blue-600 leading-tight">7</p>
              <p className="text-xs text-gray-600 tracking-wide">Городов</p>
            </div>
            <div className="text-center bg-white/60 rounded-xl py-2 backdrop-blur-sm border border-white/40">
              <p className="text-lg font-bold text-purple-600 leading-tight">15</p>
              <p className="text-xs text-gray-600 tracking-wide">Фото</p>
            </div>
          </div>

          {/* Последние поездки */}
          <div className="space-y-2">
            {[
              { name: 'Самарканд', date: 'Ноябрь 2024', rating: 5, image: '🕌', gradient: 'from-amber-500 to-orange-500' },
              { name: 'Бухара', date: 'Октябрь 2024', rating: 5, image: '🏛️', gradient: 'from-blue-500 to-indigo-500' },
              { name: 'Хива', date: 'Сентябрь 2024', rating: 4, image: '🏰', gradient: 'from-purple-500 to-violet-500' }
            ].map((trip, index) => (
              <div key={index} className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-white/30">
                <div className={`w-8 h-8 bg-gradient-to-br ${trip.gradient} rounded-xl flex items-center justify-center shadow-lg shadow-black/10 ring-1 ring-white/50`}>
                  <span className="text-sm">{trip.image}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-xs leading-tight tracking-wide">{trip.name}</p>
                  <p className="text-xs text-gray-500 leading-tight tracking-wide">{trip.date}</p>
                </div>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < trip.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Реферальная программа */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-orange-50 via-red-50/50 to-orange-100/30 rounded-2xl border border-orange-200/50 p-4 shadow-lg shadow-orange-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xs text-white">💰</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Реферальная программа
              </h2>
            </div>
            <button className="text-orange-600 text-xs font-medium hover:text-red-600 tracking-wide">
              Подробнее
            </button>
          </div>

          {/* Баланс */}
          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl p-3 mb-3 shadow-lg shadow-orange-500/10 border border-white/60 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-orange-600 leading-tight tracking-tight">125,000</p>
              <p className="text-xs text-gray-600 tracking-wide">сум на счету</p>
              <button className="mt-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/20">
                Вывести средства
              </button>
            </div>
          </div>

          {/* QR код */}
          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl p-3 shadow-lg shadow-orange-500/10 border border-white/60 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 ring-2 ring-white/50">
                <span className="text-white text-xs tracking-tight">QR</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-xs tracking-wide leading-tight">Ваша реферальная ссылка</p>
                <p className="text-xs text-gray-500 tracking-wide leading-tight">Приглашайте друзей и получайте бонусы!</p>
                <button className="mt-1.5 text-orange-600 text-xs font-medium hover:text-red-600 tracking-wide">
                  Поделиться →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Настройки */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-slate-50/20 rounded-2xl shadow-lg shadow-gray-500/5 border border-white/60 p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm tracking-tight">Настройки</h3>
          
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/profile/settings/')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/80 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm border border-white/30 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20">
                  <Cog6ToothIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-gray-900 text-xs tracking-wide">Настройки профиля</span>
              </div>
              <span className="text-gray-400 group-hover:text-orange-500 transition-colors">→</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50/80 hover:scale-[1.02] transition-all duration-300 text-red-600 backdrop-blur-sm border border-red-100/50 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                  <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs tracking-wide">Выйти</span>
              </div>
              <span className="text-red-400 group-hover:text-red-600 transition-colors">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 