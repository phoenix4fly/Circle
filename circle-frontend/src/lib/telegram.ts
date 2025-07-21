// Утилиты для работы с Telegram WebApp

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  SettingsButton: TelegramSettingsButton;
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  BiometricManager: TelegramBiometricManager;

  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: TelegramPopupParams, callback?: (button_id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: TelegramScanQrParams, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean) => void): void;
  invokeCustomMethod(method: string, params: any, callback?: (error: string, result: any) => void): void;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface TelegramSettingsButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: string | null, stored: boolean) => void): void;
  getItem(key: string, callback: (error: string | null, value: string | null) => void): void;
  getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (error: string | null, removed: boolean) => void): void;
  removeItems(keys: string[], callback?: (error: string | null, removed: boolean) => void): void;
  getKeys(callback: (error: string | null, keys: string[]) => void): void;
}

export interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init(callback?: () => void): void;
  requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): void;
  authenticate(params: { reason?: string }, callback?: (success: boolean, token?: string) => void): void;
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): void;
  openSettings(): void;
}

export interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

export interface TelegramPopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

export interface TelegramScanQrParams {
  text?: string;
}

// Утилиты для работы с Telegram WebApp
export const TelegramUtils = {
  /**
   * Проверяет, доступен ли Telegram WebApp
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  },

  /**
   * Получает объект Telegram WebApp
   */
  getWebApp(): TelegramWebApp | null {
    if (!this.isAvailable()) return null;
    return window.Telegram!.WebApp;
  },

  /**
   * Получает initData для аутентификации
   */
  getInitData(): string {
    const webApp = this.getWebApp();
    let initData = webApp?.initData || '';
    
    // Fallback для тестирования в development
    if (typeof window !== 'undefined' && !initData && process.env.NODE_ENV === 'development') {
      const testData = localStorage.getItem('test_telegram_data');
      if (testData) {
        initData = testData;
        console.log('🧪 Используются тестовые Telegram данные');
      }
    }
    
    // Дебаг информация
    if (typeof window !== 'undefined') {
      console.log('🔍 TelegramUtils.getInitData():');
      console.log('- WebApp available:', !!webApp);
      console.log('- initData length:', initData.length);
      console.log('- initData preview:', initData ? initData.substring(0, 100) + '...' : 'empty');
      console.log('- window.Telegram:', !!window.Telegram);
      console.log('- WebApp object:', webApp);
      console.log('- Using test data:', !!localStorage.getItem('test_telegram_data'));
    }
    
    return initData;
  },

  /**
   * Получает данные пользователя из initDataUnsafe
   */
  getUser(): TelegramUser | null {
    const webApp = this.getWebApp();
    return webApp?.initDataUnsafe?.user || null;
  },

  /**
   * Проверяет, запущено ли приложение в Telegram
   */
  isInTelegram(): boolean {
    const available = this.isAvailable();
    const hasInitData = !!this.getInitData();
    const webApp = this.getWebApp();
    
    // Дополнительные проверки для лучшей диагностики
    const isValid = available && hasInitData && !!webApp && 
                   (webApp?.platform !== 'unknown' || webApp?.version !== '0.0');
    
    if (typeof window !== 'undefined') {
      console.log('🔍 isInTelegram check:', {
        available,
        hasInitData,
        platform: webApp?.platform,
        version: webApp?.version,
        result: isValid
      });
    }
    
    return isValid;
  },

  /**
   * Инициализирует WebApp
   */
  ready(): void {
    const webApp = this.getWebApp();
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  },

  /**
   * Настраивает тему приложения
   */
  setupTheme(): void {
    const webApp = this.getWebApp();
    if (!webApp) return;

    // Применяем цвета темы Telegram
    const themeParams = webApp.themeParams;
    if (themeParams.bg_color) {
      document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color);
    }
    if (themeParams.button_color) {
      document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color);
    }
  },

  /**
   * Показывает уведомление через Telegram
   */
  showAlert(message: string): void {
    const webApp = this.getWebApp();
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  },

  /**
   * Показывает подтверждение через Telegram
   */
  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const webApp = this.getWebApp();
      if (webApp) {
        webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  },

  /**
   * Вибрация через Haptic Feedback
   */
  vibrate(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light'): void {
    const webApp = this.getWebApp();
    if (!webApp?.HapticFeedback) return;

    if (type === 'success' || type === 'error' || type === 'warning') {
      webApp.HapticFeedback.notificationOccurred(type);
    } else {
      webApp.HapticFeedback.impactOccurred(type);
    }
  },

  /**
   * Закрывает WebApp
   */
  close(): void {
    const webApp = this.getWebApp();
    if (webApp) {
      webApp.close();
    }
  },

  /**
   * Получает версию WebApp
   */
  getVersion(): string {
    const webApp = this.getWebApp();
    return webApp?.version || '0.0';
  },

  /**
   * Получает платформу
   */
  getPlatform(): string {
    const webApp = this.getWebApp();
    return webApp?.platform || 'unknown';
  },

  /**
   * Проверяет, поддерживается ли версия WebApp
   */
  isVersionAtLeast(version: string): boolean {
    const currentVersion = this.getVersion();
    return this.compareVersions(currentVersion, version) >= 0;
  },

  /**
   * Сравнивает две версии
   */
  compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }
}; 