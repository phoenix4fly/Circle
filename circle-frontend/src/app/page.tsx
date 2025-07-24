'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, BellIcon, MapPinIcon, CalendarIcon, UsersIcon, HomeIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Tour as ApiTour, toursApi } from '@/lib/api';

// Моковые данные для туров с участниками
const mockTours = [
  {
    id: 1,
    title: "Самарканд: Жемчужина Востока",
    location: "Самарканд, Узбекистан",
    price: 750000,
    duration: "2 дня",
    participants: 8,
    maxParticipants: 15,
    joinedUsers: [
      { id: 1, name: "Алиса К.", avatar: "AK", color: "bg-blue-500" },
      { id: 2, name: "Даниил М.", avatar: "ДМ", color: "bg-green-500" },
      { id: 3, name: "София Н.", avatar: "СН", color: "bg-purple-500" },
      { id: 4, name: "Максим Р.", avatar: "МР", color: "bg-red-500" },
      { id: 5, name: "Елена В.", avatar: "ЕВ", color: "bg-yellow-500" },
      { id: 6, name: "Артем Л.", avatar: "АЛ", color: "bg-indigo-500" },
      { id: 7, name: "Карина С.", avatar: "КС", color: "bg-pink-500" },
      { id: 8, name: "Никита Б.", avatar: "НБ", color: "bg-teal-500" }
    ]
  },
  {
    id: 2,
    title: "Бухара: Город-музей под открытым небом",
    location: "Бухара, Узбекистан", 
    price: 650000,
    duration: "1 день",
    participants: 5,
    maxParticipants: 12,
    joinedUsers: [
      { id: 9, name: "Анна П.", avatar: "АП", color: "bg-cyan-500" },
      { id: 10, name: "Владислав Т.", avatar: "ВТ", color: "bg-lime-500" },
      { id: 11, name: "Милана К.", avatar: "МК", color: "bg-rose-500" },
      { id: 12, name: "Эмиль Х.", avatar: "ЭХ", color: "bg-amber-500" },
      { id: 13, name: "Дарья А.", avatar: "ДА", color: "bg-emerald-500" }
    ]
  },
  {
    id: 3,
    title: "Чарвакское водохранилище: Отдых у воды",
    location: "Чарвак, Узбекистан",
    price: 450000,
    duration: "1 день",
    participants: 12,
    maxParticipants: 20,
    joinedUsers: [
      { id: 14, name: "Рустам У.", avatar: "РУ", color: "bg-violet-500" },
      { id: 15, name: "Лейла С.", avatar: "ЛС", color: "bg-sky-500" },
      { id: 16, name: "Тимур Ж.", avatar: "ТЖ", color: "bg-orange-500" },
      { id: 17, name: "Нигора И.", avatar: "НИ", color: "bg-fuchsia-500" },
      { id: 18, name: "Азиз М.", avatar: "АМ", color: "bg-slate-500" },
      { id: 19, name: "Севара Б.", avatar: "СБ", color: "bg-stone-500" },
      { id: 20, name: "Фаррух Р.", avatar: "ФР", color: "bg-zinc-500" },
      { id: 21, name: "Замира К.", avatar: "ЗК", color: "bg-neutral-500" },
      { id: 22, name: "Улугбек Т.", avatar: "УТ", color: "bg-gray-500" },
      { id: 23, name: "Нодира Х.", avatar: "НХ", color: "bg-red-400" },
      { id: 24, name: "Шахзод А.", avatar: "ША", color: "bg-blue-400" },
      { id: 25, name: "Мадина О.", avatar: "МО", color: "bg-green-400" }
    ]
  },
  {
    id: 4,
    title: "Хива: Путешествие в прошлое",
    location: "Хива, Узбекистан",
    price: 850000,
    duration: "3 дня",
    participants: 3,
    maxParticipants: 10,
    joinedUsers: [
      { id: 26, name: "Камила Д.", avatar: "КД", color: "bg-purple-400" },
      { id: 27, name: "Жасур Н.", avatar: "ЖН", color: "bg-yellow-400" },
      { id: 28, name: "Гульнара С.", avatar: "ГС", color: "bg-pink-400" }
    ]
  }
];

// Категории туров
const tourCategories = [
  { id: 1, name: "Походы", icon: "🥾", color: "bg-green-100 text-green-600" },
  { id: 2, name: "Горы", icon: "🏔️", color: "bg-blue-100 text-blue-600" },
  { id: 3, name: "Экскурсии", icon: "🏛️", color: "bg-purple-100 text-purple-600" },
  { id: 4, name: "Города", icon: "🏙️", color: "bg-orange-100 text-orange-600" },
  { id: 5, name: "2-3 дня", icon: "📅", color: "bg-red-100 text-red-600" },
  { id: 6, name: "Купальные", icon: "🏖️", color: "bg-cyan-100 text-cyan-600" },
  { id: 7, name: "Культура", icon: "🎨", color: "bg-pink-100 text-pink-600" },
  { id: 8, name: "Еда", icon: "🍽️", color: "bg-yellow-100 text-yellow-600" }
];

// Рекламные баннеры
const promotionalBanners = [
  {
    id: 1,
    title: "Скидка 20% на первый тур",
    subtitle: "Присоединяйся к Circle и получи скидку",
    background: "bg-gradient-to-r from-orange-400 to-red-500",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Горные туры от 300,000 сум",
    subtitle: "Специальные предложения на выходные",
    background: "bg-gradient-to-r from-blue-400 to-purple-500",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Приведи друга и получи бонус",
    subtitle: "За каждого друга - 50,000 сум на счет",
    background: "bg-gradient-to-r from-green-400 to-teal-500",
    textColor: "text-white"
  }
];

// Турагентства
const travelAgencies = [
  { id: 1, name: "Vezdekhodi", logo: "http://127.0.0.1:8001/media/agency_logos/vezdekhodi.png", rating: 5.0, tours: 95 },
  { id: 2, name: "Travel Nation", logo: "http://127.0.0.1:8001/media/agency_logos/travelnation.jpg", rating: 4.9, tours: 62 },
  { id: 3, name: "Wolf Travel", logo: "http://127.0.0.1:8001/media/agency_logos/wolftravel.png", rating: 4.7, tours: 38 },
  { id: 4, name: "Go Travel", logo: "http://127.0.0.1:8001/media/agency_logos/gotravel.png", rating: 4.6, tours: 51 },
  { id: 5, name: "Tracker", logo: "http://127.0.0.1:8001/media/agency_logos/tracker.jpg", rating: 4.8, tours: 29 },
  { id: 6, name: "Poehali", logo: "http://127.0.0.1:8001/media/agency_logos/poehali.jpg", rating: 4.9, tours: 73 }
];

// Типы
interface User {
  id: number;
  name: string;
  avatar: string;
  color: string;
  sphere?: string;
  specialization?: string;
}

interface Tour {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  participants: number;
  maxParticipants: number;
  joinedUsers: User[];
}

// Компонент модального окна участников
const ParticipantsModal = ({ tour, isOpen, onClose }: { tour: Tour | null; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen || !tour) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[70vh] overflow-hidden">
        {/* Заголовок модального окна */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 font-helvetica">
            Участники тура
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Список участников */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-96">
          {tour.joinedUsers.map((user: User) => (
            <div key={user.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                {user.avatar}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 font-helvetica">{user.name}</p>
                <p className="text-xs text-gray-500 font-helvetica">
                  {user.specialization && user.sphere ? `${user.specialization}, ${user.sphere}` : 'Участник Circle'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка закрытия */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user, isInTelegram } = useTelegramAuth();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [tours, setTours] = useState<ApiTour[]>([]);
  const [toursLoading, setToursLoading] = useState(true);

  // Функция для преобразования участников API в формат модального окна
  const convertToModalParticipants = (participants: any[]): User[] => {
    return participants.map((participant, index) => ({
      id: participant.id,
      name: `${participant.first_name} ${participant.last_name}`,
      avatar: `${participant.first_name[0]}${participant.last_name[0]}`,
      color: `bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500`,
      sphere: participant.sphere_name,
      specialization: participant.specialization_name
    }));
  };

  // Проверка авторизации
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // Загрузка туров
  useEffect(() => {
    const loadTours = async () => {
      try {
        setToursLoading(true);
        const response = await toursApi.getTours({}, 1);
        setTours(response.results.slice(0, 4)); // Берем только первые 4 тура для главной
      } catch (error) {
        console.error('Error loading tours:', error);
      } finally {
        setToursLoading(false);
      }
    };

    if (isAuthenticated) {
      loadTours();
    }
  }, [isAuthenticated]);

  // Показываем загрузку пока проверяется авторизация
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center font-helvetica px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg animate-pulse">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2 font-helvetica">Circle</h1>
          <p className="text-gray-600 text-xs font-helvetica">Загружаем ваш профиль...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован, ничего не показываем (происходит редирект)
  if (!isAuthenticated) {
    return null;
  }

  const openParticipantsModal = (tour: Tour) => {
    setSelectedTour(tour);
    setIsParticipantsModalOpen(true);
  };

  const closeParticipantsModal = () => {
    setSelectedTour(null);
    setIsParticipantsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Мини-профиль */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Привет, {user?.first_name || 'Путешественник'}!
              </p>
              <p className="text-xs text-gray-500">Найди свою компанию</p>
            </div>
          </div>

          {/* Уведомления */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <BellIcon className="w-6 h-6 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </button>
        </div>
      </header>

      <main className="pb-24">
        {/* Категории туров */}
        <section className="px-4 py-4 bg-white">
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {tourCategories.map((category) => (
              <button 
                key={category.id}
                className={`${category.color} px-4 py-2 rounded-full flex items-center space-x-2 whitespace-nowrap text-sm font-medium transition-colors hover:scale-105`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Рекламные баннеры */}
        <section className="px-4 py-4">
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {promotionalBanners.map((banner) => (
              <div 
                key={banner.id}
                className={`${banner.background} ${banner.textColor} rounded-2xl p-6 min-w-[280px] flex-shrink-0 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                  <p className="text-sm opacity-90">{banner.subtitle}</p>
                </div>
                <div className="absolute top-4 right-4 text-4xl opacity-20">🎉</div>
              </div>
            ))}
          </div>
        </section>

        {/* Турагентства */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Наши партнеры
            </h2>
            <button className="text-orange-500 text-sm font-medium hover:text-orange-600">
              Все агентства
            </button>
          </div>
          
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {travelAgencies.map((agency) => (
              <div 
                key={agency.id}
                className="bg-white rounded-xl min-w-[140px] h-32 flex-shrink-0 border border-gray-100 hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                {/* Логотип занимает верхнюю половину без отступов */}
                <div className="h-16 w-full flex items-center justify-center bg-gray-50">
                  <img 
                    src={agency.logo} 
                    alt={`${agency.name} логотип`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      // Fallback к эмодзи если изображение не загружается
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-3xl">${agency.name === 'Vezdekhodi' ? '🚗' : agency.name === 'Travel Nation' ? '✈️' : agency.name === 'Wolf Travel' ? '🐺' : agency.name === 'Go Travel' ? '🌍' : agency.name === 'Tracker' ? '🧭' : '🚀'}</span>`;
                    }}
                  />
                </div>
                
                {/* Информация снизу с отступами */}
                <div className="h-16 p-2 text-center flex flex-col justify-center">
                  <h3 className="font-semibold text-gray-900 text-xs mb-1 font-helvetica">{agency.name}</h3>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-xs text-gray-600 font-helvetica">{agency.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-helvetica">{agency.tours} туров</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Рекомендуемые туры */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Рекомендуемые туры
            </h2>
            <button className="text-orange-500 text-sm font-medium hover:text-orange-600">
              Все туры
            </button>
          </div>

          {/* Сетка туров - 2 колонки на всех экранах */}
          <div className="grid grid-cols-2 gap-3">
            {toursLoading ? (
              // Скелетон загрузки
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="h-32 bg-gray-200 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
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
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-orange-600">
                    {(Number(tour.price_from) / 1000).toFixed(0)}к
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
                        onClick={() => {
                          const modalTour: Tour = {
                            id: tour.id,
                            title: tour.title,
                            location: tour.category?.name || 'Тур',
                            price: Number(tour.price_from),
                            duration: `${tour.duration_days} дн.`,
                                                         participants: tour.participants?.length || 0,
                             maxParticipants: 15,
                             joinedUsers: convertToModalParticipants(tour.participants || [])
                          };
                          openParticipantsModal(modalTour);
                        }}
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

                  <button 
                    onClick={() => router.push(`/tours/${tour.id}`)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-2 px-3 rounded-2xl text-xs font-medium font-helvetica transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center space-y-1 text-orange-500">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Главная</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Поиск</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 relative">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Чаты</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </nav>

      {/* Модальное окно участников */}
      <ParticipantsModal 
        tour={selectedTour} 
        isOpen={isParticipantsModalOpen} 
        onClose={closeParticipantsModal} 
      />
    </div>
  );
} 