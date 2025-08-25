import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hapticService from '../services/hapticService';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    hapticService.success();
    navigate('/onboarding');
  };
  
  return (
    <div className="app-content animate-fadeIn">
      <div className="app-header">
        <h1 className="animate-slideIn">AI Fitness Coach</h1>
        <p className="animate-slideIn" style={{ animationDelay: '0.2s' }}>Ваш персональный тренер</p>
      </div>
      
      <div className="app-body">
        <div className={`welcome-card ${isLoaded ? 'animate-fadeIn' : ''}`}>
          <div 
            className="emoji animate-bounce" 
            style={{ 
              fontSize: '80px',
              marginBottom: 'var(--spacing-xl)',
              animation: 'bounce 2s ease-in-out infinite'
            }}
          >
            💪
          </div>
          <h2 style={{ 
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '700',
            marginBottom: 'var(--spacing-md)',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Добро пожаловать!
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-3xl)',
            lineHeight: '1.6'
          }}>
            Начните свой путь к идеальной форме с персональными тренировками
          </p>
          <button 
            className="btn btn-primary btn-full btn-lg animate-glow"
            onClick={handleStart}
            data-haptic="medium"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: '700',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            🚀 Начать путешествие
          </button>
          
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'var(--primary-gradient)',
            borderRadius: '50%',
            opacity: 0.1,
            animation: 'pulse 3s ease-in-out infinite'
          }} />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;