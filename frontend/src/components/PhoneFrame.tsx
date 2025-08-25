import React from 'react';
import { motion } from 'framer-motion';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const currentTime = new Date().toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"
        />
      </div>

      {/* Phone container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Phone frame */}
        <div className="relative mx-auto" style={{ width: '375px', height: '812px' }}>
          {/* Phone outer frame */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl">
            {/* Phone bezel */}
            <div className="absolute inset-[3px] bg-black rounded-[2.85rem] overflow-hidden">
              {/* Phone screen */}
              <div className="absolute inset-[10px] bg-black rounded-[2.5rem] overflow-hidden">
                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-11 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-between px-6">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-medium">{currentTime}</span>
                  </div>
                  
                  {/* Notch */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-7 bg-black rounded-b-2xl" />
                  
                  <div className="flex items-center gap-1">
                    {/* Signal */}
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2-2v8a2 2 0 002 2h14a2 2 0 002-2V7l2 2V2l-2 2a2 2 0 00-2-2H5a2 2 0 00-2 2L1 2v7z"/>
                    </svg>
                    {/* WiFi */}
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2-2c4.97-4.97 13.03-4.97 18 0l2 2-6 6-2-2c-1.76-1.76-4.24-1.76-6 0l-2 2-6-6z"/>
                    </svg>
                    {/* Battery */}
                    <svg className="w-6 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="1" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="3" y="8" width="10" height="8" rx="1" fill="currentColor"/>
                      <rect x="21" y="10" width="2" height="4" rx="1" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* App content area */}
                <div className="absolute inset-0 pt-11 bg-[#0f0f12] overflow-hidden">
                  <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {children}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Phone buttons */}
          <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-700 rounded-r-lg" />
          <div className="absolute -left-1 top-24 w-1 h-10 bg-gray-700 rounded-l-lg" />
          <div className="absolute -left-1 top-40 w-1 h-16 bg-gray-700 rounded-l-lg" />
          <div className="absolute -left-1 top-60 w-1 h-16 bg-gray-700 rounded-l-lg" />
        </div>

        {/* Phone stand shadow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/20 rounded-full blur-2xl" />
      </motion.div>

      {/* Desktop instructions */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block"
      >
        <div className="glass rounded-2xl p-6 max-w-xs">
          <h3 className="text-xl font-bold gradient-text mb-3">AI Fitness Coach</h3>
          <p className="text-gray-400 text-sm mb-4">
            Взаимодействуйте с приложением как на реальном смартфоне
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-400">✨</span>
              <span className="text-gray-300 text-sm">Полная имитация мобильного UI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-pink-400">🎯</span>
              <span className="text-gray-300 text-sm">Интерактивные элементы</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📱</span>
              <span className="text-gray-300 text-sm">Реалистичный опыт</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side features */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
      >
        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass rounded-2xl p-4 max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Персональный тренер</h4>
                <p className="text-gray-400 text-xs">AI-powered тренировки</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass rounded-2xl p-4 max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Отслеживание прогресса</h4>
                <p className="text-gray-400 text-xs">Детальная статистика</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass rounded-2xl p-4 max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Цели и мотивация</h4>
                <p className="text-gray-400 text-xs">Достигайте результатов</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};