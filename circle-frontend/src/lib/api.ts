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
    };
  };
  telegram_id?: number;
  last_online?: string;
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
  login: string; // телефон или email
  password: string;
}

// Утилиты для работы с токенами
export const tokenUtils = {
  getTokens: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    
    const access = localStorage.getItem('circle_access_token');
    const refresh = localStorage.getItem('circle_refresh_token');
    
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  },

  setTokens: (tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('circle_access_token', tokens.access);
    localStorage.setItem('circle_refresh_token', tokens.refresh);
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('circle_access_token');
    localStorage.removeItem('circle_refresh_token');
    localStorage.removeItem('circle_user');
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('circle_user');
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('circle_user', JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    const tokens = tokenUtils.getTokens();
    return tokens !== null;
  }
};

// API клиент
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Подготавливаем заголовки
    const headers: any = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Добавляем токен авторизации если есть
    const tokens = tokenUtils.getTokens();
    if (tokens) {
      headers.Authorization = `Bearer ${tokens.access}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Если токен истек, пробуем обновить
      if (response.status === 401 && tokens) {
        const newTokens = await this.refreshToken(tokens.refresh);
        if (newTokens) {
          // Повторяем запрос с новым токеном
          headers.Authorization = `Bearer ${newTokens.access}`;
          const retryResponse = await fetch(url, { ...config, headers });
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          
          return retryResponse.json();
        } else {
          // Не удалось обновить токен - выходим
          tokenUtils.clearTokens();
          window.location.href = '/auth';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const response = await fetch(`${this.baseURL}/users/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          access: data.access,
          refresh: refreshToken, // refresh токен остается тот же
        };
        tokenUtils.setTokens(newTokens);
        return newTokens;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return null;
  }

  // Методы API
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/me/');
  }

  async getSpheres(): Promise<Array<{ id: number; name: string; description: string }>> {
    return this.request<Array<{ id: number; name: string; description: string }>>('/users/spheres/');
  }

  async getSpecializations(): Promise<Array<{ 
    id: number; 
    name: string; 
    description: string; 
    sphere: { id: number; name: string } 
  }>> {
    return this.request<Array<{ 
      id: number; 
      name: string; 
      description: string; 
      sphere: { id: number; name: string } 
    }>>('/users/specializations/');
  }
}

// Экспортируем экземпляр API клиента
export const apiClient = new ApiClient(API_BASE_URL);

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