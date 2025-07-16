'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, PhoneIcon, EnvelopeIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { apiClient, tokenUtils, type RegisterData, type LoginData } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для форм
  const [loginForm, setLoginForm] = useState({
    phoneOrEmail: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  // Функции для обработки форм
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Попытка входа:', { login: loginForm.phoneOrEmail });
      
      const loginData: LoginData = {
        login: loginForm.phoneOrEmail,
        password: loginForm.password
      };

      const response = await apiClient.login(loginData);
      
      console.log('Успешный вход:', response);
      
      // Сохраняем токены и пользователя
      tokenUtils.setTokens(response.tokens);
      tokenUtils.setUser(response.user);
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        setError('Ошибка подключения к серверу. Проверьте интернет соединение.');
      } else {
        setError(err.message || 'Неправильные данные входа. Проверьте логин и пароль.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Попытка регистрации:', registerForm);
      
      // Валидация
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      if (!registerForm.agreedToTerms) {
        throw new Error('Необходимо согласиться с условиями');
      }

      if (registerForm.password.length < 8) {
        throw new Error('Пароль должен содержать минимум 8 символов');
      }

      const registerData: RegisterData = {
        username: (registerForm.firstName.toLowerCase() + registerForm.lastName.toLowerCase()).replace(/\s+/g, ''),
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        phone_number: registerForm.phone.replace(/\s+/g, ''),
        email: registerForm.email || undefined,
        password: registerForm.password,
        password_confirm: registerForm.confirmPassword
      };

      console.log('Данные для регистрации:', registerData);

      const response = await apiClient.register(registerData);
      
      console.log('Успешная регистрация:', response);
      
      // Сохраняем токены и пользователя
      tokenUtils.setTokens(response.tokens);
      tokenUtils.setUser(response.user);
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        setError('Ошибка подключения к серверу. Проверьте интернет соединение.');
      } else {
        setError(err.message || 'Ошибка регистрации. Проверьте введенные данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование номера телефона для Узбекистана
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('998')) {
      const match = numbers.match(/^998(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
      if (match) {
        return `+998 ${match[1]}${match[2] ? ` ${match[2]}` : ''}${match[3] ? ` ${match[3]}` : ''}${match[4] ? ` ${match[4]}` : ''}`.trim();
      }
    }
    return `+998 ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 10)} ${numbers.slice(10, 12)}`.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col font-helvetica">
      {/* Заголовок */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-5">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Circle</h1>
            <p className="text-xs text-gray-600 font-medium mt-1">Найди свою компанию для путешествий</p>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 px-4 py-6">
        {/* Табы */}
        <div className="bg-gray-200/60 backdrop-blur-sm rounded-xl p-1 mb-6 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-lg shadow-primary-500/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-gray-900 shadow-lg shadow-primary-500/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Форма входа */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto space-y-4">
            <form onSubmit={handleLogin}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-200/50">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Добро пожаловать!</h2>
                
                {/* Ошибки */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
                
                {/* Поле телефона или email */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Телефон или Email
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={loginForm.phoneOrEmail}
                      onChange={(e) => setLoginForm({ ...loginForm, phoneOrEmail: e.target.value })}
                      placeholder="+998 XX XXX XX XX или email@example.com"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Поле пароля */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Пароль
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Введите пароль"
                      className="w-full pl-9 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Забыли пароль */}
                <div className="text-right mb-6">
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Забыли пароль?
                  </button>
                </div>

                {/* Кнопка входа */}
                <button
                  type="submit"
                  disabled={isLoading || !loginForm.phoneOrEmail || !loginForm.password}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Входим...' : 'Войти в Circle'}
                </button>
              </div>
            </form>
            
            {/* Ссылка на регистрацию */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Нет аккаунта?{' '}
                <button
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Пройдите регистрацию
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Форма регистрации */}
        {activeTab === 'register' && (
          <div className="max-w-md mx-auto space-y-4">
            <form onSubmit={handleRegister}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-900/5 border border-gray-200/50">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Создать аккаунт</h2>
                
                {/* Ошибки */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
                
                {/* Имя и Фамилия */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Имя
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        placeholder="Имя"
                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      placeholder="Фамилия"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Телефон */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Номер телефона <span className="text-primary-500">*</span>
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setRegisterForm({ ...registerForm, phone: formatted });
                      }}
                      placeholder="+998 XX XXX XX XX"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Email <span className="text-gray-500 text-xs normal-case">(необязательно)</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Укажите email для восстановления пароля и уведомлений
                  </p>
                </div>

                {/* Пароль */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Пароль
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Минимум 8 символов"
                      className="w-full pl-9 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Подтверждение пароля */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Повторите пароль
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      placeholder="Повторите пароль"
                      className="w-full pl-9 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Согласие с условиями */}
                <div className="mb-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={registerForm.agreedToTerms}
                      onChange={(e) => setRegisterForm({ ...registerForm, agreedToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      required
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      Я согласен с{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                        условиями использования
                      </a>{' '}
                      и{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                        политикой конфиденциальности
                      </a>
                    </span>
                  </label>
                </div>

                {/* Кнопка регистрации */}
                <button
                  type="submit"
                  disabled={
                    !registerForm.agreedToTerms || 
                    isLoading || 
                    !registerForm.firstName || 
                    !registerForm.lastName || 
                    !registerForm.phone || 
                    !registerForm.password || 
                    !registerForm.confirmPassword ||
                    registerForm.password !== registerForm.confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? 'Создаем аккаунт...' : 'Создать аккаунт'}
                </button>
              </div>
            </form>
            
            {/* Ссылка на вход */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Войдите
                </button>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Подвал */}
      <footer className="px-4 py-6 text-center">
        <p className="text-xs text-gray-600 font-medium">
          © 2024 Circle. Создаем лучшие путешествия вместе
        </p>
      </footer>
    </div>
  );
} 