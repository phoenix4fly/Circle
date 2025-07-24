'use client';

import { useState } from 'react';

interface TourSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TourSearch = ({ value, onChange, placeholder = "Поиск туров..." }: TourSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative mb-6">
      <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-900/5 border transition-all duration-200 ${
        isFocused 
          ? 'border-red-500 shadow-xl shadow-red-500/10' 
          : 'border-gray-200/50 hover:border-gray-300'
      }`}>
        {/* Иконка поиска */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Поле ввода */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 font-helvetica text-lg"
        />

        {/* Кнопка очистки */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Подсказки */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg p-4 z-10">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 font-helvetica">Популярные запросы:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'Самарканд',
              'Экскурсионные туры',
              'Бухара',
              'Треккинг',
              'Горы',
              'Хива'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-full text-sm transition-colors font-helvetica"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourSearch; 