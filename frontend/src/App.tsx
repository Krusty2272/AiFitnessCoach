import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/Home';
import OnboardingScreen from './screens/Onboarding';
import DashboardScreen from './screens/Dashboard';
import WorkoutSelectScreen from './screens/WorkoutSelect';
import WorkoutExecutionScreen from './screens/WorkoutExecution';
import ProgressScreen from './screens/Progress';
import ProfileScreen from './screens/Profile';
import hapticService from './services/hapticService';

const App: React.FC = () => {
  // Initialize haptic service
  useEffect(() => {
    hapticService.autoAttach();
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

  return (
    <Router>
      <div className="phone-container">
        {/* iPhone Frame */}
        <div className="phone">
          {/* Side Buttons */}
          <div className="volume-up"></div>
          <div className="volume-down"></div>
          <div className="silent-switch"></div>
          <div className="power-button"></div>
          
          {/* Phone Screen */}
          <div className="phone-screen">
            {/* Status Bar */}
            <div className="status-bar">
              <div className="status-bar-left">
                <span className="time">{getCurrentTime()}</span>
              </div>
              <div className="status-bar-center">
                <div className="notch"></div>
              </div>
              <div className="status-bar-right">
                <span className="signal">📶</span>
                <span className="wifi">📶</span>
                <span className="battery">🔋</span>
              </div>
            </div>
            
            {/* App Content with Routing */}
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/workout/select" element={<WorkoutSelectScreen />} />
              <Route path="/workout/generate" element={<div className="app-content"><h2>AI Генератор</h2></div>} />
              <Route path="/workout/:id" element={<WorkoutExecutionScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
            
            {/* Home Indicator */}
            <div className="home-indicator"></div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;