'use client';

import React from 'react';
import { MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

interface TourCardProps {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  participants: number;
  maxParticipants: number;
}

export default function TourCard({ 
  title, 
  location, 
  price, 
  duration, 
  image, 
  participants, 
  maxParticipants 
}: TourCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Изображение */}
      <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-medium">📸 {title}</span>
        </div>
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-orange-600">
          {price.toLocaleString()} сум
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">{title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
            {duration}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2 text-orange-500" />
            {participants}/{maxParticipants} участников
          </div>
        </div>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
          Присоединиться
        </button>
      </div>
    </div>
  );
} 