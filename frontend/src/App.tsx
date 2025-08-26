import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  const [isTelegram, setIsTelegram] = useState(false);
  
  // Initialize services
  useEffect(() => {
    const init = async () => {
      // Проверяем и инициализируем Telegram WebApp
      if (telegramService.isTelegramWebApp()) {
        await telegramService.initialize();
        setIsTelegram(true);
      }
      
      // Инициализируем haptic service
      hapticService.autoAttach();
    };
    
    init();
  }, []);

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Единый рендер для всех платформ
  const AppContent = () => (
    <Routes>
      <Route path="/" element={isTelegram ? <DashboardScreen /> : <HomeScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/workout/select" element={<WorkoutSelectScreen />} />
      <Route path="/workout/generate" element={<div className="app-content"><h2>AI Генератор</h2></div>} />
      <Route path="/workout/:id" element={<WorkoutExecutionScreen />} />
      <Route path="/progress" element={<ProgressScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/social" element={<SocialScreen />} />
      <Route path="/achievements" element={<AchievementsScreen />} />
      <Route path="/level" element={<LevelDetailsScreen />} />
    </Routes>
  );

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