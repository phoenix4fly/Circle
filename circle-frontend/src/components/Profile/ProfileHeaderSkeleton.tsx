'use client';

import React from 'react';

const ProfileHeaderSkeleton = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Фоновые градиенты */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-red-400/10 to-pink-400/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/60 to-white/40" />
      
      {/* Главный контейнер */}
      <div className="relative bg-white/40 backdrop-blur-md border-b border-white/30">
        <div className="px-4 py-6">
          
          {/* Навигация */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl animate-pulse" />
            <div className="h-6 w-20 bg-white/60 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl animate-pulse" />
          </div>

          {/* Основная информация */}
          <div className="flex items-start space-x-4">
            {/* Аватар скелетон */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse shadow-lg" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg animate-pulse" />
            </div>

            {/* Информация скелетон */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Имя */}
              <div className="h-6 w-32 bg-white/60 rounded-lg animate-pulse" />
              
              {/* Username */}
              <div className="h-4 w-24 bg-white/60 rounded-lg animate-pulse" />
              
              {/* ID */}
              <div className="h-3 w-16 bg-white/60 rounded-lg animate-pulse" />
              
              {/* Статус */}
              <div className="h-3 w-20 bg-white/60 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Сфера и специализация скелетон */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/60 rounded-lg animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-28 bg-white/60 rounded-lg animate-pulse" />
                <div className="h-3 w-24 bg-white/60 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Кнопка редактирования скелетон */}
          <div className="mt-6">
            <div className="w-full h-12 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton; 