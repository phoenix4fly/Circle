'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Плавное появление
    setTimeout(() => setIsVisible(true), 50);
    
    // Автоматическое скрытие
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  // Иконки для разных типов
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'info':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  // Цвета для разных типов
  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div
      className={`
        fixed right-4 bg-white rounded-xl shadow-lg border p-4 min-w-[280px] max-w-[400px] z-50
        transition-all duration-300 ease-out font-helvetica
        ${getColors()}
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      style={{
        top: `${80 + (parseInt(id) * 80)}px` // Располагаем тосты друг под другом
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Иконка */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 font-helvetica">
            {title}
          </p>
          {message && (
            <p className="text-xs text-gray-600 mt-1 font-helvetica">
              {message}
            </p>
          )}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Прогресс бар */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div 
          className={`
            h-1 rounded-full transition-all ease-linear
            ${type === 'success' ? 'bg-green-500' : 
              type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
          `}
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast; 