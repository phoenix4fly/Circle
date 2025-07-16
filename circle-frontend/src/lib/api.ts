// API клиент для Circle Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

// Типы для API
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  avatar?: string;
  bio?: string;
  interests?: string;
  sphere?: {
    id: number;
    name: string;
    description: string;
  };
  specialization?: {
    id: number;
    name: string;
    description: string;
    sphere: {
      id: number;
      name: string;
      description: string;
    };
  };
  preferred_activities?: ActivityType[];
  preferred_destinations?: Destination[];
  preferred_trip_formats?: TripFormat[];
  preferred_travel_styles?: TravelStyle[];
  preferred_travel_locations?: TravelLocation[];
  preferred_trip_durations?: TripDuration[];
  onboarding_completed: boolean;
  sphere_selected: boolean;
  preferences_selected: boolean;
  telegram_id?: number;
  last_online?: string;
}

// Новые типы для onboarding
export interface Sphere {
  id: number;
  name: string;
  description: string;
}

export interface Specialization {
  id: number;
  name: string;
  description: string;
  sphere: Sphere;
}

export interface ActivityType {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Destination {
  id: number;
  name: string;
  description: string;
  region: string;
  icon: string;
}

export interface TripFormat {
  id: number;
  name: string;
  description: string;
  icon: string;
}

// Новые типы для обновленных предпочтений
export interface TravelStyle {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface TravelLocation {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface TripDuration {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface SphereSelectionData {
  sphere: number;
  specialization?: number;
}

export interface PreferencesSelectionData {
  preferred_activities?: number[];
  preferred_destinations?: number[];
  preferred_trip_formats?: number[];
  preferred_travel_styles?: number[];
  preferred_travel_locations?: number[];
  preferred_trip_durations?: number[];
}

// Утилиты для работы с токенами
export const tokenUtils = {
  getTokens: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const tokens = localStorage.getItem('circle_tokens');
    return tokens ? JSON.parse(tokens) : null;
  },

  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('circle_tokens', JSON.stringify(tokens));
  },

  removeTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('circle_tokens');
    localStorage.removeItem('circle_user');
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('circle_user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('circle_user', JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!tokenUtils.getTokens()?.access;
  }
};

// HTTP клиент с автоматическим добавлением токенов
const httpClient = {
  async request(url: string, options: RequestInit = {}) {
    const tokens = tokenUtils.getTokens();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      // Если токен истек, попробуем обновить
      if (response.status === 401 && tokens?.refresh) {
        const refreshResponse = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: tokens.refresh }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          tokenUtils.setTokens(newTokens);
          
          // Повторяем оригинальный запрос с новым токеном
          headers.Authorization = `Bearer ${newTokens.access}`;
          return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
        } else {
          // Refresh токен тоже невалиден, выходим
          tokenUtils.removeTokens();
          window.location.href = '/auth';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  },

  async get(url: string) {
    const response = await this.request(url);
    return response.json();
  },

  async post(url: string, data: any) {
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async patch(url: string, data: any) {
    const response = await this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(url: string, data: any) {
    const response = await this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(url: string) {
    const response = await this.request(url, {
      method: 'DELETE',
    });
    return response.status === 204 ? null : response.json();
  }
};

// API клиент
export const apiClient = {
  // Аутентификация
  async register(data: RegisterData): Promise<AuthResponse> {
    return httpClient.post('/users/register/', data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    return httpClient.post('/users/login/', data);
  },

  async getMe(): Promise<User> {
    return httpClient.get('/users/me/');
  },

  // Onboarding
  async getSpheres(): Promise<Sphere[]> {
    const response = await httpClient.get('/users/spheres/');
    return response.results;
  },

  async getSpecializations(sphereId?: number): Promise<Specialization[]> {
    const url = sphereId 
      ? `/users/spheres/${sphereId}/specializations/`
      : '/users/specializations/';
    const response = await httpClient.get(url);
    return sphereId ? response : response.results;
  },

  async selectSphere(data: SphereSelectionData): Promise<{ message: string; user: User }> {
    return httpClient.patch('/users/users/select_sphere/', data);
  },

  async getActivityTypes(): Promise<ActivityType[]> {
    const response = await httpClient.get('/users/activity-types/');
    return response.results;
  },

  async getDestinations(): Promise<Destination[]> {
    const response = await httpClient.get('/users/destinations/');
    return response.results;
  },

  async getTripFormats(): Promise<TripFormat[]> {
    const response = await httpClient.get('/users/trip-formats/');
    return response.results;
  },

  // Новые методы для обновленных предпочтений
  async getTravelStyles(): Promise<TravelStyle[]> {
    const response = await httpClient.get('/users/travel-styles/');
    return response.results;
  },

  async getTravelLocations(): Promise<TravelLocation[]> {
    const response = await httpClient.get('/users/travel-locations/');
    return response.results;
  },

  async getTripDurations(): Promise<TripDuration[]> {
    const response = await httpClient.get('/users/trip-durations/');
    return response.results;
  },

  async selectPreferences(data: PreferencesSelectionData): Promise<{ 
    message: string; 
    user: User; 
    onboarding_completed: boolean 
  }> {
    return httpClient.patch('/users/users/select_preferences/', data);
  }
};

// Экспортируем типы ошибок
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 