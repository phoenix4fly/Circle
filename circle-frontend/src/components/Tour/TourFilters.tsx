'use client';

import { useState, useEffect } from 'react';
import { TourCategory, TourFilters as TourFiltersType, toursApi } from '@/lib/api';

interface TourFiltersProps {
  filters: TourFiltersType;
  onFiltersChange: (filters: TourFiltersType) => void;
  onClear: () => void;
}

const TourFilters = ({ filters, onFiltersChange, onClear }: TourFiltersProps) => {
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Загружаем категории
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await toursApi.getCategories();
        setCategories(response.results);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (categoryId: number) => {
    onFiltersChange({
      ...filters,
      type: filters.type === categoryId ? undefined : categoryId
    });
  };

  const handlePriceChange = (field: 'price_min' | 'price_max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue
    });
  };

  const hasActiveFilters = filters.type || filters.price_min || filters.price_max;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-gray-900/5 border border-gray-200/50 mb-6">
      {/* Заголовок с кнопкой показать/скрыть */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 font-helvetica">Фильтры</h3>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-600 font-semibold font-helvetica transition-colors"
            >
              Очистить все
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="font-helvetica text-xs mr-2">
              {showFilters ? 'Скрыть' : 'Показать'}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Контент фильтров */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
        {/* Категории */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 mb-3 font-helvetica">Тип тура</h4>
          {isLoading ? (
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 font-helvetica ${
                    filters.type === category.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Цена */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 mb-3 font-helvetica">Цена (сум)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-helvetica">От</label>
              <input
                type="number"
                placeholder="100к"
                value={filters.price_min || ''}
                onChange={(e) => handlePriceChange('price_min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-helvetica"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-helvetica">До</label>
              <input
                type="number"
                placeholder="1000к"
                value={filters.price_max || ''}
                onChange={(e) => handlePriceChange('price_max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-helvetica"
              />
            </div>
          </div>
        </div>



        {/* Быстрые фильтры */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 mb-3 font-helvetica">Быстрые фильтры</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFiltersChange({ ...filters, price_max: 300000 })}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors font-helvetica"
            >
              До 300К
            </button>
            <button
              onClick={() => onFiltersChange({ ...filters, price_max: 200000 })}
              className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors font-helvetica"
            >
              Выходные
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourFilters; 