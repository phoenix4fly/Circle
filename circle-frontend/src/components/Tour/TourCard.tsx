'use client';

import { Tour } from '@/lib/api';
import Link from 'next/link';
import { MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import WishlistButton from './WishlistButton';

interface TourCardProps {
  tour: Tour;
}

const TourCard = ({ tour }: TourCardProps) => {
  return (
    <Link href={`/tours/${tour.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Изображение */}
        <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
          {tour.main_image?.url ? (
            <img 
              src={tour.main_image.url} 
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium text-center px-2">📸 {tour.title.substring(0, 20)}</span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <div 
            className="absolute top-2 left-2 z-10"
            onClick={(e) => e.preventDefault()} // Предотвращаем переход по ссылке при клике на кнопку
          >
            <WishlistButton 
              tourId={tour.id}
              isWishlisted={tour.is_wishlisted || false}
              size="small"
            />
          </div>
          
          {/* Цена */}
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-orange-600">
            {(Number(tour.price_from) / 1000).toFixed(0)}к сум
          </div>
        </div>

        {/* Контент */}
        <div className="p-4 rounded-t-lg">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm leading-tight font-helvetica">{tour.title}</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600 font-helvetica">
              <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
              {tour.category?.name || 'Тур'}
            </div>
            <div className="flex items-center text-sm text-gray-600 font-helvetica">
              <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
              {tour.duration_days} дн.
            </div>
            <div className="flex items-center text-sm text-gray-600 font-helvetica">
              <UsersIcon className="w-4 h-4 mr-2 text-orange-500" />
              {tour.participants?.length || 0} участн.
            </div>
          </div>

          {/* Аватарки участников */}
          {tour.participants && tour.participants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2 font-helvetica">Участники:</p>
              <div 
                className="flex items-center space-x-1 cursor-pointer group/participants"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Здесь можно добавить логику для открытия модального окна участников
                  console.log('Показать участников:', tour.participants);
                }}
              >
                {/* Показываем первые 4 аватарки для большей карточки */}
                {tour.participants.slice(0, 4).map((participant, index) => (
                  <div 
                    key={participant.id} 
                    className={`w-8 h-8 bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white group-hover:scale-110 group-hover/participants:scale-125 transition-transform`}
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                  >
                    {participant.first_name?.[0]}{participant.last_name?.[0]}
                  </div>
                ))}
                
                {/* Показываем "+X" если участников больше 4 */}
                {tour.participants.length > 4 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white group-hover:scale-110 group-hover/participants:scale-125 transition-transform" style={{ marginLeft: '-8px' }}>
                    +{tour.participants.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопка "Подробнее" */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/tours/${tour.id}`;
            }}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-2 px-3 rounded-2xl text-sm font-medium font-helvetica transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Подробнее
          </button>

          {/* Сессии */}
          {tour.sessions && tour.sessions.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-helvetica">
                  Ближайшая дата: {new Date(tour.sessions[0].start_date).toLocaleDateString('ru-RU')}
                </span>
                <span className="text-gray-500 font-helvetica">
                  {tour.sessions[0].available_seats} мест
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
