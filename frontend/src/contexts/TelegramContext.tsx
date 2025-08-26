import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import telegramService, { TelegramUser, TelegramTheme } from '../services/telegramService';

interface TelegramContextType {
  isInitialized: boolean;
  isTelegram: boolean;
  user: TelegramUser | null;
  theme: TelegramTheme;
  platform: string;
  version: string;
  initData: string;
  
  // Хаптик
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notification: (type?: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  
  // UI элементы
  mainButton: {
    show: (text: string, onClick: () => void) => void;
    hide: () => void;
    setProgress: (visible: boolean) => void;
  };
  
  backButton: {
    show: (onClick: () => void) => void;
    hide: () => void;
  };
  
  // Cloud Storage
  cloud: {
    save: (key: string, value: any) => Promise<boolean>;
    get: (key: string) => Promise<any>;
    remove: (key: string) => Promise<boolean>;
  };
  
  // Утилиты
  utils: {
    openLink: (url: string) => void;
    openTelegramLink: (url: string) => void;
    share: (url: string, text?: string) => void;
    showAlert: (message: string) => Promise<void>;
    showConfirm: (message: string) => Promise<boolean>;
    close: () => void;
  };
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<TelegramTheme>({});
  const [platform, setPlatform] = useState('unknown');
  const [version, setVersion] = useState('0.0.0');
  const [initData, setInitData] = useState('');

  useEffect(() => {
    const init = async () => {
      await telegramService.initialize();
      
      setUser(telegramService.getUser());
      setTheme(telegramService.getTheme());
      setPlatform(telegramService.getPlatform());
      setVersion(telegramService.getVersion());
      setInitData(telegramService.getInitData());
      setIsInitialized(true);
    };

    init();
  }, []);

  const contextValue: TelegramContextType = {
    isInitialized,
    isTelegram: telegramService.isTelegramWebApp(),
    user,
    theme,
    platform,
    version,
    initData,
    
    haptic: {
      impact: (style) => telegramService.impactOccurred(style),
      notification: (type) => telegramService.notificationOccurred(type),
      selection: () => telegramService.selectionChanged()
    },
    
    mainButton: {
      show: (text, onClick) => telegramService.showMainButton(text, onClick),
      hide: () => telegramService.hideMainButton(),
      setProgress: (visible) => telegramService.setMainButtonProgress(visible)
    },
    
    backButton: {
      show: (onClick) => telegramService.showBackButton(onClick),
      hide: () => telegramService.hideBackButton()
    },
    
    cloud: {
      save: async (key, value) => {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return await telegramService.saveToCloud(key, stringValue);
      },
      get: async (key) => {
        const value = await telegramService.getFromCloud(key);
        if (!value) return null;
        
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      remove: (key) => telegramService.removeFromCloud(key)
    },
    
    utils: {
      openLink: (url) => telegramService.openLink(url),
      openTelegramLink: (url) => telegramService.openTelegramLink(url),
      share: (url, text) => telegramService.shareURL(url, text),
      showAlert: (message) => telegramService.showAlert(message),
      showConfirm: (message) => telegramService.showConfirm(message),
      close: () => telegramService.close()
    }
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};