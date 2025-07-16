'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, tokenUtils } from '@/lib/api';
import type { TravelStyle, TravelLocation, TripDuration } from '@/lib/api';

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Данные из API
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [travelLocations, setTravelLocations] = useState<TravelLocation[]>([]);
  const [tripDurations, setTripDurations] = useState<TripDuration[]>([]);

  // Выбранные предпочтения
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Используем правильную проверку авторизации
        if (!tokenUtils.isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // Проверяем профиль пользователя
        const profile = await apiClient.getMe();
        
        // Если пользователь еще не выбрал сферу - редирект
        if (!profile.sphere_selected) {
          router.push('/onboarding/sphere');
          return;
        }

        // Если уже завершил onboarding - редирект на главную
        if (profile.onboarding_completed) {
          router.push('/');
          return;
        }

        // Загружаем данные для выбора
        const [styles, locations, durations] = await Promise.all([
          apiClient.getTravelStyles(),
          apiClient.getTravelLocations(),
          apiClient.getTripDurations()
        ]);

        setTravelStyles(styles);
        setTravelLocations(locations);
        setTripDurations(durations);

        setLoading(false);
      } catch (err: any) {
        setError('Ошибка загрузки данных');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    initializePage();
  }, [router]);

  // Обработчики выбора
  const toggleStyle = (id: number) => {
    setSelectedStyles(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleLocation = (id: number) => {
    setSelectedLocations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleDuration = (id: number) => {
    setSelectedDurations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Функция для получения иконки
  const getIcon = (iconKey: string) => {
    const iconMap: { [key: string]: string } = {
      // Стили отдыха
      'active': '🏃‍♂️',
      'relaxed': '🧘‍♀️',
      'balanced': '⚖️',
      'spontaneous': '🎲',
      'mindful': '🌱',
      'social': '👥',
      'solitary': '🚶‍♂️',
      'family': '👨‍👩‍👧‍👦',
      'extreme': '🤾‍♂️',

      // Локации  
      'mountains': '🏔️',
      'canyons': '🏜️',
      'desert': '🏜️',
      'forest': '🌲',
      'lakes': '🏞️',
      'historical': '🏛️',
      'ancient': '🗿',
      'urban': '🏙️',
      'village': '🏘️',
      'beach': '🏖️',
      'parks': '🌳',

      // Форматы поездки
      'one-day': '☀️',
      'weekend': '📅',
      'long': '🗓️',
      'spontaneous-trip': '⚡',
      'morning-evening': '🌅',
      'camping': '⛺',
      'comfort': '🏨',
      'bus-auto': '🚌',
      'hiking': '🥾'
    };
    return iconMap[iconKey] || '📍';
  };

  // Отправка предпочтений
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      await apiClient.selectPreferences({
        preferred_travel_styles: selectedStyles,
        preferred_travel_locations: selectedLocations,
        preferred_trip_durations: selectedDurations,
      });

      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения предпочтений');
      setSubmitting(false);
    }
  };

  // Пропустить шаг
  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await apiClient.selectPreferences({
        preferred_travel_styles: [],
        preferred_travel_locations: [],
        preferred_trip_durations: [],
      });
      router.push('/');
    } catch (err: any) {
      setError('Ошибка при пропуске шага');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-800">Загружаем варианты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">🌿 Давай познакомимся ближе</h1>
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-sm leading-relaxed text-gray-700">
                Чтобы Circle был для тебя не просто списком туров, а местом встреч и вдохновения, 
                расскажи нам немного о своих вкусах.
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                Это поможет нам советовать то, что по-настоящему откликается.
              </p>
              <p className="text-sm leading-relaxed font-medium text-gray-900">
                А тебе — немного лучше узнать себя.
              </p>
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Шаг 2 из 2</span>
                <div className="w-20 bg-gray-200 rounded-full h-1 ml-3">
                  <div className="bg-orange-600 rounded-full h-1 w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700 text-center font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Стиль отдыха */}
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-orange-600 mb-2">Стиль отдыха</h2>
              <p className="text-gray-700 text-sm">Как ты предпочитаешь проводить время?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {travelStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedStyles.includes(style.id)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">
                      {getIcon(style.icon)}
                    </div>
                    <h3 className="font-semibold text-orange-600 text-sm mb-2">{style.name}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{style.description}</p>
                  </div>
                  
                  {selectedStyles.includes(style.id) && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Локации */}
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-orange-600 mb-2">Локации</h2>
              <p className="text-gray-700 text-sm">Какие места тебе интересны?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {travelLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => toggleLocation(location.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedLocations.includes(location.id)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">
                      {getIcon(location.icon)}
                    </div>
                    <h3 className="font-semibold text-orange-600 text-sm mb-2">{location.name}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{location.description}</p>
                  </div>
                  
                  {selectedLocations.includes(location.id) && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Формат поездки */}
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-orange-600 mb-2">Формат поездки</h2>
              <p className="text-gray-700 text-sm">Как тебе удобнее путешествовать?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {tripDurations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => toggleDuration(duration.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedDurations.includes(duration.id)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">
                      {getIcon(duration.icon)}
                    </div>
                    <h3 className="font-semibold text-orange-600 text-sm mb-2">{duration.name}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{duration.description}</p>
                  </div>
                  
                  {selectedDurations.includes(duration.id) && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Кнопки действий */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 bg-white rounded-2xl font-semibold transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
          >
            Пропустить
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Сохраняем...
              </div>
            ) : (
              <>
                {selectedStyles.length + selectedLocations.length + selectedDurations.length > 0 
                  ? `Сохранить выбор (${selectedStyles.length + selectedLocations.length + selectedDurations.length})` 
                  : 'Завершить настройку'
                }
              </>
            )}
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Ты сможешь изменить предпочтения в любое время в настройках профиля
          </p>
        </div>
      </div>
    </div>
  );
} 