'use client';

import { useEffect, useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useWishlistToggle } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';

interface WishlistButtonProps {
  tourId: number;
  isWishlisted: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  onToggle?: (isWishlisted: boolean) => void;
}

const WishlistButton = ({ 
  tourId, 
  isWishlisted: initialIsWishlisted, 
  size = 'medium',
  showText = false,
  className = '',
  onToggle 
}: WishlistButtonProps) => {
  const { 
    isWishlisted, 
    isLoading, 
    error, 
    toggleWishlist, 
    setIsWishlisted 
  } = useWishlistToggle(tourId, initialIsWishlisted);

  const [isAnimating, setIsAnimating] = useState(false);
  const { showSuccess, showError } = useToast();

  // Обновляем состояние если пропс изменился
  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted, setIsWishlisted]);

  // Размеры для разных вариантов
  const sizes = {
    small: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs',
      padding: 'p-1'
    },
    medium: {
      button: 'w-10 h-10',
      icon: 'w-5 h-5', 
      text: 'text-sm',
      padding: 'p-2'
    },
    large: {
      button: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base',
      padding: 'p-3'
    }
  };

  const currentSize = sizes[size];

  const handleToggle = async () => {
    if (isLoading) return;

    setIsAnimating(true);

    try {
      const newIsWishlisted = await toggleWishlist();
      
      // Показываем Toast уведомление
      if (newIsWishlisted) {
        showSuccess(
          'Добавлено в планы! ❤️',
          'Тур сохранен в ваших запланированных поездках'
        );
      } else {
        showSuccess(
          'Удалено из планов',
          'Тур убран из списка запланированных'
        );
      }
      
      // Вызываем callback если передан
      onToggle?.(newIsWishlisted);
      
    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);
      
      // Показываем ошибку через Toast
      showError(
        'Упс! Что-то пошло не так',
        'Попробуйте еще раз через несколько секунд'
      );
    } finally {
      // Убираем анимацию через небольшую задержку
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  // Классы для кнопки
  const buttonClasses = `
    ${currentSize.button} 
    ${currentSize.padding}
    rounded-full 
    flex items-center justify-center
    transition-all duration-200 ease-in-out
    ${isWishlisted 
      ? 'bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300' 
      : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
    }
    ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer hover:scale-110'}
    ${isAnimating ? 'animate-bounce' : ''}
    ${className}
  `.trim();

  // Классы для иконки 
  const iconClasses = `
    ${currentSize.icon}
    transition-all duration-300 ease-in-out
    ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
    ${isAnimating ? 'scale-125' : ''}
  `.trim();

  // Текст для кнопки  
  const getButtonText = () => {
    if (isLoading) return 'Сохранение...';
    if (isWishlisted) {
      return size === 'large' ? 'В моих планах' : 'В планах';
    }
    return size === 'large' ? 'Добавить в планы' : 'Wish';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Кнопка с иконкой */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={buttonClasses}
        title={isWishlisted ? 'Удалить из планов' : 'Добавить в планы'}
        aria-label={isWishlisted ? 'Удалить из планов' : 'Добавить в планы'}
      >
        {isWishlisted ? (
          <HeartSolidIcon className={iconClasses} />
        ) : (
          <HeartIcon className={iconClasses} />
        )}
      </button>

      {/* Текст (опционально) */}
      {showText && (
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            ${currentSize.text}
            font-medium transition-colors duration-200
            ${isWishlisted 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-gray-600 hover:text-red-600'
            }
            ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}
          `.trim()}
        >
          {getButtonText()}
        </button>
      )}
    </div>
  );
};

export default WishlistButton; 