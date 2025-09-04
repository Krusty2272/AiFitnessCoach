import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './screens/Home';
import OnboardingScreen from './screens/Onboarding';
import DashboardScreen from './screens/Dashboard';
import WorkoutSelectScreen from './screens/WorkoutSelect';
import WorkoutExecutionScreen from './screens/WorkoutExecution';
import ProgressScreen from './screens/Progress';
import ProfileScreen from './screens/Profile';
import SocialScreen from './screens/Social';
import AchievementsScreen from './screens/Achievements';
import LevelDetailsScreen from './screens/LevelDetails';
import hapticService from './services/hapticService';
import telegramService from './services/telegramService';
import { ThemeProvider } from './contexts/ThemeContext';
import { TelegramProvider } from './contexts/TelegramContext';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const [isTelegram, setIsTelegram] = useState(false);
  const { user, loading, isAuthenticated, login } = useAuth();
  
  // Оптимизация производительности для мобильных устройств
  usePerformanceOptimization();
  
  // Initialize services
  useEffect(() => {
    const init = async () => {
      // Проверяем и инициализируем Telegram WebApp
      if (telegramService.isTelegramWebApp()) {
        await telegramService.initialize();
        setIsTelegram(true);
        
        // Автоматическая авторизация для Telegram пользователей
        if (!isAuthenticated && !loading) {
          await login();
        }
      }
      
      // Инициализируем haptic service
      hapticService.autoAttach();
    };
    
    init();
  }, [isAuthenticated, loading]);

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Компонент загрузки
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Загрузка...</p>
      </div>
    </div>
  );

  // Защищенный маршрут
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <LoadingScreen />;
    if (!isAuthenticated && isTelegram) return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
  };

  // Единый рендер для всех платформ
  const AppContent = () => {
    if (loading) return <LoadingScreen />;

    return (
      <Routes>
        <Route path="/" element={
          isTelegram ? (
            isAuthenticated ? <DashboardScreen /> : <OnboardingScreen />
          ) : (
            <HomeScreen />
          )
        } />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardScreen /></ProtectedRoute>
        } />
        <Route path="/workout/select" element={
          <ProtectedRoute><WorkoutSelectScreen /></ProtectedRoute>
        } />
        <Route path="/workout/generate" element={
          <ProtectedRoute><div className="app-content"><h2>AI Генератор</h2></div></ProtectedRoute>
        } />
        <Route path="/workout/:id" element={
          <ProtectedRoute><WorkoutExecutionScreen /></ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute><ProgressScreen /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfileScreen /></ProtectedRoute>
        } />
        <Route path="/social" element={
          <ProtectedRoute><SocialScreen /></ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute><AchievementsScreen /></ProtectedRoute>
        } />
        <Route path="/level" element={
          <ProtectedRoute><LevelDetailsScreen /></ProtectedRoute>
        } />
      </Routes>
    );
  };

  // Если Telegram - оборачиваем в TelegramProvider
  if (isTelegram) {
    return (
      <TelegramProvider>
        <ThemeProvider>
          <Router>
            <div className="app-container telegram-app">
              <AppContent />
            </div>
          </Router>
        </ThemeProvider>
      </TelegramProvider>
    );
  }

  // Для обычного браузера
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <AppContent />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;