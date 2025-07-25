'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: HomeIcon, label: 'Главная', href: '/', clickable: true },
    { icon: MagnifyingGlassIcon, label: 'Поиск', href: '/tours', clickable: true },
    { icon: ChatBubbleLeftRightIcon, label: 'Чаты', href: '/chats', clickable: false },
    { icon: UserIcon, label: 'Профиль', href: '/profile', clickable: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/tours' && pathname.startsWith('/tours'));
          
          // Если кнопка не кликабельная, рендерим div вместо Link
          if (!item.clickable) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 font-helvetica text-gray-300 cursor-not-allowed"
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 font-helvetica ${
                isActive
                  ? 'text-red-500 bg-red-50 shadow-lg shadow-red-500/20 transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
