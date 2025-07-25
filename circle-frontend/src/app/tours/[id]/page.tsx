'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tour, toursApi } from '@/lib/api';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import WishlistButton from '@/components/Tour/WishlistButton';

const TourDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isLoading: authLoading } = useTelegramAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'schedule' | 'sessions'>('description');

  // Загрузка тура
  useEffect(() => {
    const loadTour = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const tourData = await toursApi.getTourById(Number(id));
        setTour(tourData);
        if (tourData.main_image) {
          setSelectedImage(tourData.main_image.url);
        }
      } catch (error) {
        console.error('Error loading tour:', error);
        setError('Тур не найден или произошла ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    loadTour();
  }, [id]);

  const formatPrice = (price: number) => {
    const thousands = Math.round(price / 1000);
    return `${thousands}к сум`;
  };

  const formatDuration = (days: number, nights?: number) => {
    if (nights) {
      return `${days} дн. / ${nights} ноч.`;
    }
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🏔️</span>
          </div>
          <p className="text-gray-600 font-helvetica">Загрузка тура...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 font-helvetica">Тур не найден</h2>
          <p className="text-gray-600 mb-6 font-helvetica">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors font-helvetica"
            >
              Назад
            </button>
            <Link 
              href="/tours"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg font-helvetica"
            >
              Все туры
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-helvetica">
      {/* Заголовок с навигацией */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1 font-helvetica">
                <Link href="/tours" className="hover:text-red-500 transition-colors">Туры</Link>
                <span>•</span>
                <span className="text-gray-900 truncate">{tour.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - изображения и основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Галерея */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
              {/* Основное изображение */}
              <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">🏔️</span>
                      </div>
                      <p className="text-gray-500 font-helvetica">Изображение недоступно</p>
                    </div>
                  </div>
                )}

                {/* Категория */}
                {tour.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-sm font-semibold">
                      {tour.category.name}
                    </span>
                  </div>
                )}

                {/* Цена */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    от {formatPrice(tour.price_from)}
                  </div>
                </div>
              </div>

              {/* Миниатюры галереи */}
              {tour.gallery && tour.gallery.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex space-x-3 overflow-x-auto">
                    {tour.main_image && (
                      <button
                        onClick={() => setSelectedImage(tour.main_image!.url)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === tour.main_image.url
                            ? 'border-red-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={tour.main_image.url}
                          alt={tour.main_image.title || 'Основное фото'}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {tour.gallery.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.url)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image.url
                            ? 'border-red-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.title || `Фото ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Заголовок и базовая информация */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
              <h1 className="text-xl font-bold text-gray-900 mb-4 font-helvetica">{tour.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl mb-1">⏱️</div>
                  <div className="text-xs text-gray-600 font-helvetica">Длительность</div>
                  <div className="font-semibold text-sm font-helvetica">{formatDuration(tour.duration_days, tour.duration_nights)}</div>
                </div>
                
                {tour.distance_from_tashkent_km && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">📍</div>
                    <div className="text-xs text-gray-600 font-helvetica">Расстояние</div>
                    <div className="font-semibold text-sm font-helvetica">{tour.distance_from_tashkent_km} км</div>
                  </div>
                )}
                
                {tour.transport_options && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">🚗</div>
                    <div className="text-xs text-gray-600 font-helvetica">Транспорт</div>
                    <div className="font-semibold text-xs font-helvetica">{JSON.stringify(tour.transport_options).replace(/[{}:"]/g, '').replace(/,/g, ', ')}</div>
                  </div>
                )}
                
                {tour.sessions && tour.sessions.length > 0 && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">👥</div>
                    <div className="text-xs text-gray-600 font-helvetica">Группа</div>
                    <div className="font-semibold text-sm font-helvetica">{tour.sessions[0].current_participants}/{tour.sessions[0].max_participants}</div>
                  </div>
                )}
              </div>

              {/* Табы */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'description', label: 'Описание', icon: '📄' },
                    { id: 'schedule', label: 'Программа', icon: '📅' },
                    { id: 'sessions', label: 'Даты', icon: '🗓️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-xs font-helvetica transition-colors ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Контент табов */}
              <div className="min-h-48">
                {activeTab === 'description' && (
                  <div className="prose prose-gray max-w-none">
                    {tour.description ? (
                      <p className="text-xs text-gray-700 leading-relaxed font-helvetica">{tour.description}</p>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <span className="text-3xl block mb-2">📄</span>
                        <p className="text-xs font-helvetica">Описание тура пока недоступно</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div>
                    {tour.schedule && tour.schedule.length > 0 ? (
                      <div className="space-y-3">
                        {tour.schedule.map((day) => (
                          <div key={day.id} className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1 font-helvetica">День {day.day}: {day.title}</h4>
                            <p className="text-xs text-gray-700 font-helvetica">{day.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <span className="text-3xl block mb-2">📅</span>
                        <p className="text-xs font-helvetica">Программа тура уточняется</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div>
                    {tour.sessions && tour.sessions.length > 0 ? (
                      <div className="space-y-3">
                        {tour.sessions.map((session) => (
                          <div key={session.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm font-helvetica">
                                {new Date(session.start_date).toLocaleDateString('ru-RU')} - {new Date(session.end_date).toLocaleDateString('ru-RU')}
                              </div>
                              <div className="text-xs text-gray-600 font-helvetica">
                                Участников: {session.current_participants}/{session.max_participants}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-red-600 font-helvetica">{formatPrice(session.price)}</div>
                              <div className={`text-xs font-helvetica ${session.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                {session.is_active ? 'Доступно' : 'Недоступно'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <span className="text-3xl block mb-2">🗓️</span>
                        <p className="text-xs font-helvetica">Даты проведения уточняются</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Участники тура */}
              {tour.participants && tour.participants.length > 0 && (
                <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 font-helvetica">
                    👥 Участники тура ({tour.participants.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {tour.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500 rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {participant.first_name?.[0]}{participant.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 font-helvetica">
                            {participant.first_name} {participant.last_name}
                          </p>
                          <p className="text-xs text-gray-600 font-helvetica">
                            {participant.specialization_name && participant.sphere_name 
                              ? `${participant.specialization_name}, ${participant.sphere_name}` 
                              : 'Участник Circle'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - бронирование */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-xl font-bold text-gray-900 mb-2 font-helvetica">
                    от {formatPrice(tour.price_from)}
                  </div>
                  <div className="text-xs text-gray-600 font-helvetica">за человека</div>
                </div>

                {tour.sessions && tour.sessions.length > 0 ? (
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 px-5 rounded-xl font-semibold text-sm font-helvetica transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      🎯 Забронировать тур
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-helvetica transition-colors">
                        <span>💬</span>
                        <span>Вопросы</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-helvetica transition-colors">
                        <span>📤</span>
                        <span>Поделиться</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-xs text-gray-600 space-y-2 font-helvetica">
                        <div className="flex justify-between">
                          <span>Ближайшая дата:</span>
                          <span className="font-semibold">
                            {new Date(tour.sessions[0].start_date).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Свободных мест:</span>
                          <span className="font-semibold">
                            {tour.sessions[0]?.available_seats || (tour.sessions[0]?.max_participants - tour.sessions[0]?.current_participants) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-3 px-5 rounded-xl font-semibold text-sm font-helvetica cursor-not-allowed"
                    >
                      Даты уточняются
                    </button>
                  </div>
                )}

                {/* Секция "Добавить в планы" */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-helvetica">
                        Хочу поехать!
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 font-helvetica">
                        Сохраните тур в планы, чтобы не потерять. Мы уведомим о скидках и новых датах!
                      </p>
                      
                      <WishlistButton
                        tourId={tour.id}
                        isWishlisted={tour.is_wishlisted || false}
                        size="large"
                        showText={true}
                        className="shadow-md hover:shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 font-helvetica">
                    <span>🔒</span>
                    <span>Безопасная оплата</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 font-helvetica">
                    <span>↩️</span>
                    <span>Бесплатная отмена за 24 часа</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 font-helvetica">
                    <span>📞</span>
                    <span>Поддержка 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage; 