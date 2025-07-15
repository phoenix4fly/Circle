'use client';

import React from 'react';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const navItems = [
    { icon: HomeIcon, label: 'Главная', active: true },
    { icon: MagnifyingGlassIcon, label: 'Поиск', active: false },
    { icon: ChatBubbleLeftRightIcon, label: 'Чаты', active: false },
    { icon: UserIcon, label: 'Профиль', active: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item, index) => {
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
  );
}
