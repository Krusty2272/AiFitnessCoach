import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onNavigate }) => {
  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/generate', icon: '✨', label: 'Создать' },
    { path: '/workout', icon: '💪', label: 'Тренировка' },
    { path: '/profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="glass-dark border-t border-white/5">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate(item.path)}
                  className="relative flex flex-col items-center p-3 min-w-[70px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className={`text-2xl mb-1 ${isActive ? 'drop-shadow-lg' : ''}`}
                  >
                    {item.icon}
                  </motion.div>
                  
                  <span
                    className={`text-xs transition-colors ${
                      isActive 
                        ? 'text-white font-semibold' 
                        : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 right-1/2 translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}; 