'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { apiClient, tokenUtils, type Sphere, type Specialization } from '@/lib/api';

export default function SphereSelectionPage() {
  const router = useRouter();
  const [spheres, setSpheres] = useState<Sphere[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSphere, setSelectedSphere] = useState<number | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем авторизацию
  useEffect(() => {
    if (!tokenUtils.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    loadSpheres();
  }, [router]);

  const loadSpheres = async () => {
    try {
      const spheresData = await apiClient.getSpheres();
      setSpheres(spheresData);
    } catch (error: any) {
      setError('Ошибка загрузки данных');
      console.error('Error loading spheres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecializations = async (sphereId: number) => {
    try {
      const specializationsData = await apiClient.getSpecializations(sphereId);
      setSpecializations(specializationsData);
    } catch (error: any) {
      console.error('Error loading specializations:', error);
    }
  };

  const handleSphereSelect = async (sphereId: number) => {
    setSelectedSphere(sphereId);
    setSelectedSpecialization(null);
    await loadSpecializations(sphereId);
  };

  const handleSubmit = async () => {
    if (!selectedSphere) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.selectSphere({
        sphere: selectedSphere,
        specialization: selectedSpecialization || undefined,
      });

      console.log('Sphere selection successful:', response);
      
      // Обновляем данные пользователя
      tokenUtils.setUser(response.user);
      
      // Переходим к следующему шагу
      router.push('/onboarding/preferences');
    } catch (error: any) {
      setError(error.message || 'Ошибка сохранения');
      console.error('Error selecting sphere:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center font-helvetica">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col font-helvetica">
      {/* Заголовок */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-blue-200 px-4 py-5">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-blue-900">Circle</h1>
            <p className="text-xs text-blue-700 font-medium mt-1">Настройка профиля</p>
          </div>
        </div>
      </header>

      {/* Прогресс */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-800">Шаг 1 из 2</span>
            <span className="text-xs text-blue-600">50%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 rounded-full h-2 w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="flex-1 px-4 pb-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">🌟 Расскажи, чем ты занимаешься</h2>
            <p className="text-sm text-blue-800 leading-relaxed">
              Это поможет нам связать тебя с людьми схожих интересов и профессий. 
              Общие темы для разговора и взаимопонимание — основа хороших путешествий!
            </p>
          </div>

          {/* Ошибки */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Выбор сферы */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Сфера деятельности</h3>
            <div className="grid grid-cols-1 gap-3">
              {spheres.map((sphere) => (
                <button
                  key={sphere.id}
                  onClick={() => handleSphereSelect(sphere.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedSphere === sphere.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm">{sphere.name}</h4>
                      <p className="text-xs text-blue-700 mt-1">{sphere.description}</p>
                    </div>
                    {selectedSphere === sphere.id && (
                      <CheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 ml-3" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Выбор специализации */}
          {selectedSphere && specializations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Специализация</h3>
              <p className="text-xs text-blue-700 mb-4">Необязательно, но поможет точнее подобрать круг общения</p>
              <div className="grid grid-cols-1 gap-3">
                {specializations.map((specialization) => (
                  <button
                    key={specialization.id}
                    onClick={() => setSelectedSpecialization(specialization.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedSpecialization === specialization.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">{specialization.name}</h4>
                        <p className="text-xs text-blue-700 mt-1">{specialization.description}</p>
                      </div>
                      {selectedSpecialization === specialization.id && (
                        <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0 ml-3" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка продолжить */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={!selectedSphere || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохраняем...
                </div>
              ) : (
                <div className="flex items-center">
                  Продолжить
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </div>
              )}
            </button>
          </div>

          {/* Пропустить */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/onboarding/preferences')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Пропустить этот шаг
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 