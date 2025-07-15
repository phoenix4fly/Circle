'use client';

import React from 'react';
import { UserIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
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
  );
}
