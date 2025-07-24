'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tour, TourFilters as TourFiltersType, toursApi } from '@/lib/api';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import TourCard from '@/components/Tour/TourCard';
import TourFilters from '@/components/Tour/TourFilters';
import TourSearch from '@/components/Tour/TourSearch';

const ToursPage = () => {
  const { isLoading: authLoading } = useTelegramAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Состояние фильтров
  const [filters, setFilters] = useState<TourFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка туров
  const loadTours = useCallback(async (page: number = 1, resetList: boolean = false) => {
    try {
      setIsLoading(resetList);
      setError(null);

      const filtersWithSearch = {
        ...filters,
        search: searchDebounce || undefined
      };

      const response = await toursApi.getTours(filtersWithSearch, page);
      
      if (resetList) {
        setTours(response.results);
      } else {
        setTours(prev => [...prev, ...response.results]);
      }
      
      setTotalCount(response.count);
      setHasNextPage(!!response.next);
      setHasPrevPage(!!response.previous);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading tours:', error);
      setError('Ошибка загрузки туров. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchDebounce]);

  // Загружаем туры при изменении фильтров или поиска
  useEffect(() => {
    loadTours(1, true);
  }, [loadTours]);

  const handleFiltersChange = (newFilters: TourFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      loadTours(currentPage + 1, false);
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🏔️</span>
          </div>
          <p className="text-gray-600 font-helvetica">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-helvetica">
      {/* Заголовок */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">Каталог туров</h1>
                <p className="text-xs text-gray-600">
                  {totalCount > 0 ? `Найдено ${totalCount} ${totalCount === 1 ? 'тур' : totalCount < 5 ? 'тура' : 'туров'}` : 'Ищем туры...'}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg"
                >
                  Сбросить всё
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Боковая панель с фильтрами */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <TourFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>

          {/* Основная область */}
          <div className="lg:col-span-3">
            {/* Поиск */}
            <TourSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск туров по названию или описанию..."
            />

            {/* Результаты */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-base font-semibold text-red-900 mb-2">Ошибка загрузки</h3>
                <p className="text-xs text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => loadTours(1, true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            ) : (
              <>
                {/* Загрузка первой страницы */}
                {isLoading && tours.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white/90 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-5 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tours.length > 0 ? (
                  <>
                    {/* Сетка туров */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                      {tours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                      ))}
                    </div>

                    {/* Кнопка "Загрузить ещё" */}
                    {hasNextPage && (
                      <div className="text-center">
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoading}
                          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            isLoading
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Загрузка...
                            </span>
                          ) : (
                            `Загрузить ещё (осталось ${totalCount - tours.length})`
                          )}
                        </button>
                      </div>
                    )}

                    {/* Информация о количестве показанных туров */}
                    <div className="text-center text-gray-500 text-xs mt-6">
                      Показано {tours.length} из {totalCount} туров
                    </div>
                  </>
                ) : (
                  // Нет результатов
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">Туры не найдены</h3>
                    <p className="text-xs text-gray-600 mb-6 max-w-md mx-auto">
                      Попробуйте изменить параметры поиска или очистить фильтры
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg transform hover:-translate-y-0.5"
                      >
                        Очистить фильтры
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToursPage; 