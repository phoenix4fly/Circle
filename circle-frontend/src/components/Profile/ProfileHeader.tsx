'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  Cog6ToothIcon, 
  PencilIcon,
  CameraIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { User } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onChangeAvatar?: () => void;
}

const ProfileHeader = React.memo<ProfileHeaderProps>(({ 
  user, 
  isOwnProfile = true, 
  onEditProfile, 
  onChangeAvatar 
}) => {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [avatarError, setAvatarError] = useState(false);

  // Мемоизируем статус онлайн
  const onlineStatus = useMemo(() => {
    if (!user.last_online) return 'недавно';
    
    const lastOnline = new Date(user.last_online);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastOnline.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'сейчас онлайн';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return lastOnline.toLocaleDateString('ru-RU');
  }, [user.last_online]);

  // Мемоизируем функцию копирования
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${type} скопирован в буфер обмена`);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  }, [showSuccess]);

  // Мемоизируем функцию получения инициалов
  const getInitials = useMemo(() => {
    if (!user.first_name && !user.last_name) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }, [user.first_name, user.last_name]);

  // Мемоизируем навигационные функции
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/profile/settings/');
  }, [router]);

  const handleEditProfile = useCallback(() => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      router.push('/profile/edit/');
    }
  }, [onEditProfile, router]);

  const handleChangeAvatar = useCallback(() => {
    if (onChangeAvatar) {
      onChangeAvatar();
    }
  }, [onChangeAvatar]);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Фирменные фоновые градиенты */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-600/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/60" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl -translate-x-8 -translate-y-8" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-2xl translate-x-4 -translate-y-4" />
      
      {/* Главный контейнер с улучшенным глассморфизмом */}
      <div className="relative bg-white/50 backdrop-blur-xl border-b border-white/40 shadow-lg shadow-black/5">
        <div className="px-4 py-5">
          
          {/* Навигация */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={handleBack}
              className="w-9 h-9 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/10"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-700" />
            </button>
            
            <h1 className="text-base font-medium text-gray-900 tracking-tight">
              Профиль
            </h1>
            
            {isOwnProfile && (
              <button 
                onClick={handleSettings}
                className="w-9 h-9 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/10"
              >
                <Cog6ToothIcon className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </div>

          {/* Основная информация */}
          <div className="flex items-start space-x-3">
            {/* Аватар */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-xl shadow-orange-500/30 overflow-hidden ring-2 ring-white/50">
                {user.avatar && !avatarError ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-full object-cover"
                    onError={handleAvatarError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg tracking-tight">
                      {getInitials}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Кнопка изменения аватара */}
              {isOwnProfile && (
                <button
                  onClick={handleChangeAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ring-2 ring-white/80"
                >
                  <CameraIcon className="w-3.5 h-3.5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Информация о пользователе */}
            <div className="flex-1 min-w-0">
              {/* Имя и фамилия */}
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
                {user.first_name} {user.last_name}
              </h2>
              
              {/* Username с возможностью копирования */}
              <button
                onClick={() => copyToClipboard(user.username, 'Username')}
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors mt-0.5 group"
              >
                <span className="text-xs tracking-wide">@{user.username}</span>
                <ClipboardIcon className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              {/* ID пользователя */}
              <button
                onClick={() => copyToClipboard(`#${user.id}`, 'ID')}
                className="flex items-center space-x-1 text-gray-400 hover:text-orange-500 transition-colors mt-0.5 group"
              >
                <span className="text-xs tracking-wide">#{user.id}</span>
                <ClipboardIcon className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              {/* Статус онлайн */}
              <div className="text-xs text-gray-400 mt-1 tracking-wide">
                {onlineStatus}
              </div>
            </div>
          </div>

          {/* Сфера и специализация */}
          <div className="mt-3">
            {user.sphere && (
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-xs">💼</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 tracking-wide">
                    {user.sphere.name}
                  </p>
                  {user.specialization && (
                    <p className="text-xs text-gray-500 tracking-wide">
                      {user.specialization.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Кнопка редактирования профиля */}
          {isOwnProfile && (
            <div className="mt-4">
              <button
                onClick={handleEditProfile}
                className="w-full bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border border-white/50 rounded-2xl py-2.5 px-4 flex items-center justify-center space-x-2 hover:from-white/90 hover:to-white/80 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/5"
              >
                <PencilIcon className="w-3.5 h-3.5 text-gray-700" />
                <span className="text-xs font-medium text-gray-900 tracking-wide">
                  Редактировать профиль
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  });

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader; 