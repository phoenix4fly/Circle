'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import WishlistButton from './WishlistButton';

interface TourParticipant {
  id: number;
  first_name: string;
  last_name: string;
  sphere_name?: string;
  specialization_name?: string;
  avatar?: string;
}

interface TourCardProps {
  tour: {
    id: number;
    title: string;
    price_from: string;
    duration_days: number;
    is_wishlisted?: boolean;
    category?: {
      name: string;
    };
    main_image?: {
      url: string;
    };
    participants?: TourParticipant[];
  };
  showButton?: boolean;
  onParticipantsClick?: (participants: TourParticipant[]) => void;
}

export default function TourCardMain({ tour, showButton = true, onParticipantsClick }: TourCardProps) {
  const router = useRouter();

  const handleParticipantsClick = () => {
    if (onParticipantsClick && tour.participants) {
      onParticipantsClick(tour.participants);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Изображение */}
      <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
        {tour.main_image?.url ? (
          <img 
            src={tour.main_image.url} 
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-medium text-center px-2">📸 {tour.title.substring(0, 20)}</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <div 
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.preventDefault()} // Предотвращаем переход при клике на кнопку
        >
          <WishlistButton 
            tourId={tour.id}
            isWishlisted={tour.is_wishlisted || false}
            size="small"
          />
        </div>
        
        {/* Цена */}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-orange-600">
          {(Number(tour.price_from) / 1000).toFixed(0)}к сум
        </div>
      </div>

      {/* Контент */}
      <div className="p-3 rounded-t-lg">
        <h3 className="font-semibold text-gray-900 mb-2 text-xs leading-tight font-helvetica">{tour.title}</h3>
        
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600 font-helvetica">
            <MapPinIcon className="w-3 h-3 mr-1 text-orange-500" />
            {tour.category?.name || 'Тур'}
          </div>
          <div className="flex items-center text-xs text-gray-600 font-helvetica">
            <CalendarIcon className="w-3 h-3 mr-1 text-orange-500" />
            {tour.duration_days} дн.
          </div>
          <div className="flex items-center text-xs text-gray-600 font-helvetica">
            <UsersIcon className="w-3 h-3 mr-1 text-orange-500" />
            {tour.participants?.length || 0} участн.
          </div>
        </div>

        {/* Аватарки участников */}
        {tour.participants && tour.participants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1 font-helvetica">Участники:</p>
            <div 
              className="flex items-center space-x-1 cursor-pointer group"
              onClick={handleParticipantsClick}
            >
              {/* Показываем первые 3 аватарки */}
              {tour.participants.slice(0, 3).map((participant, index) => (
                <div 
                  key={participant.id} 
                  className={`w-6 h-6 bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white group-hover:scale-110 transition-transform`}
                  style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                >
                  {participant.first_name?.[0]}{participant.last_name?.[0]}
                </div>
              ))}
              
              {/* Показываем "+X" если участников больше 3 */}
              {tour.participants.length > 3 && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border border-white group-hover:scale-110 transition-transform" style={{ marginLeft: '-4px' }}>
                  +{tour.participants.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Кнопка */}
        {showButton && (
          <button 
            onClick={() => router.push(`/tours/${tour.id}`)}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-2 px-3 rounded-2xl text-xs font-medium font-helvetica transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Подробнее
          </button>
        )}
      </div>
    </div>
  );
} 