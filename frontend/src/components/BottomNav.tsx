import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import hapticService from '../services/hapticService';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { path: '/dashboard', icon: '🏠', label: 'Главная' },
    { path: '/workout/select', icon: '💪', label: 'Тренировки' },
    { path: '/progress', icon: '📊', label: 'Прогресс' },
    { path: '/profile', icon: '👤', label: 'Профиль' }
  ];

  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.animation = 'slideIn 0.5s ease-out 0.5s both';
    }
  }, []);

  const handleNavClick = (path: string) => {
    hapticService.light();
    navigate(path);
  };

  return (
    <div 
      ref={navRef}
      className="bottom-nav"
      style={{
        position: 'absolute',
        bottom: 'var(--spacing-xl)',
        left: 'var(--spacing-xl)', 
        right: 'var(--spacing-xl)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'var(--backdrop-blur)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-md)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 100,
        transition: 'var(--transition-medium)'
      }}
    >
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            className={`nav-button ${isActive ? 'active' : ''}`}
            data-haptic="light"
            style={{
              position: 'relative',
              background: isActive ? 'var(--primary-gradient)' : 'transparent',
              border: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              fontSize: 'var(--font-size-2xl)',
              cursor: 'pointer',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              transition: 'var(--transition-medium)',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
              animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`
            }}
            title={item.label}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              setTimeout(() => {
                e.currentTarget.style.transform = isActive ? 'translateY(-2px)' : 'translateY(0)';
              }, 100);
            }}
          >
            {item.icon}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};