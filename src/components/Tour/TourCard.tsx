'use client';

import React, { useMemo } from 'react';
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

const TourCard = React.memo<TourCardProps>(({ 
  title, 
  location, 
  price, 
  duration, 
  image, 
  participants, 
  maxParticipants 
}) => {
  // Мемоизируем форматирование цены
  const formattedPrice = useMemo(() => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return price.toString();
  }, [price]);

  // Мемоизируем проценты заполненности
  const fillPercentage = useMemo(() => {
    return Math.round((participants / maxParticipants) * 100);
  }, [participants, maxParticipants]);

  // Мемоизируем стиль для градиента
  const imageStyle = useMemo(() => ({
    backgroundImage: image ? `url(${image})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }), [image]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Изображение */}
      <div 
        className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative"
        style={imageStyle}
      >
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-6xl">🏔️</span>
          </div>
        )}
        
        {/* Ценник */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-sm font-bold text-gray-800">{formattedPrice} ₽</span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2 text-orange-500" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
            <span>{duration}</span>
          </div>
          
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-orange-500" />
            <span>{participants}/{maxParticipants} участников ({fillPercentage}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TourCard.displayName = 'TourCard';

export default TourCard; 