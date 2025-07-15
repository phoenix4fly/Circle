'use client';

import React from 'react';
import { UserIcon, BellIcon, MapPinIcon, CalendarIcon, UsersIcon, HomeIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// Моковые данные для туров
const mockTours = [
  {
    id: 1,
    title: "Самарканд: Жемчужина Востока",
    location: "Самарканд, Узбекистан",
    price: 750000,
    duration: "2 дня",
    participants: 8,
    maxParticipants: 15
  },
  {
    id: 2,
    title: "Бухара: Город-музей под открытым небом",
    location: "Бухара, Узбекистан", 
    price: 650000,
    duration: "1 день",
    participants: 5,
    maxParticipants: 12
  },
  {
    id: 3,
    title: "Чарвакское водохранилище: Отдых у воды",
    location: "Чарвак, Узбекистан",
    price: 450000,
    duration: "1 день",
    participants: 12,
    maxParticipants: 20
  },
  {
    id: 4,
    title: "Хива: Путешествие в прошлое",
    location: "Хива, Узбекистан",
    price: 850000,
    duration: "3 дня",
    participants: 3,
    maxParticipants: 10
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Добро пожаловать!</p>
              <p className="text-xs text-gray-500">Найди свой круг</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="px-4 py-6 pb-24">
        {/* Приветственный блок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Circle
          </h1>
          <p className="text-gray-600 text-sm">
            YOUR CIRCLE. YOUR JOURNEY.
          </p>
        </div>

        {/* Раздел рекомендуемых туров */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Рекомендуемые туры
            </h2>
            <button className="text-orange-500 text-sm font-medium hover:text-orange-600">
              Все туры
            </button>
          </div>

          {/* Сетка туров */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockTours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Изображение */}
                <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📸 {tour.title}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-orange-600">
                    {tour.price.toLocaleString()} сум
                  </div>
                </div>

                {/* Контент */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{tour.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
                      {tour.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="w-4 h-4 mr-2 text-orange-500" />
                      {tour.participants}/{tour.maxParticipants} участников
                    </div>
                  </div>

                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    Присоединиться
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Раздел категорий */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Популярные направления
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['🏛️ Исторические', '🏔️ Горы', '🏖️ Озера', '🎯 Приключения'].map((category) => (
              <button
                key={category}
                className="bg-white p-4 rounded-xl border border-gray-100 text-left hover:border-orange-200 hover:bg-orange-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{category}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { icon: HomeIcon, label: 'Главная', active: true },
            { icon: MagnifyingGlassIcon, label: 'Поиск', active: false },
            { icon: ChatBubbleLeftRightIcon, label: 'Чаты', active: false },
            { icon: UserIcon, label: 'Профиль', active: false },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  item.active
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
} 