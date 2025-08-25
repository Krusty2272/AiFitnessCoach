import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Stats {
  totalWorkouts: number;
  currentStreak: number;
  totalTime: number;
  caloriesBurned: number;
}

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalWorkouts: 24,
        currentStreak: 7,
        totalTime: 1080,
        caloriesBurned: 8420
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden">
      {/* Animated Background Elements - smaller for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 left-5 w-32 h-32 bg-purple-500 rounded-full opacity-10 blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-5 w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-2xl"
        />
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Header Section - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">
            <span className="gradient-text">{greeting}</span>
          </h1>
          <p className="text-sm text-gray-400">Готовы к новой тренировке?</p>
        </motion.div>

        {/* Hero Card - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-3 animate-float">
                💪
              </div>
              <h2 className="text-xl font-bold mb-2">AI Fitness Coach</h2>
              <p className="text-gray-400 text-xs mb-4">Персональный тренер с искусственным интеллектом</p>
              
              <div className="flex flex-col gap-2 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/generate'}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-shadow w-full"
                >
                  Создать тренировку
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/workout'}
                  className="px-4 py-2.5 glass rounded-xl text-sm font-semibold border border-white/10 hover:border-white/20 transition-colors w-full"
                >
                  Быстрый старт
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Mobile optimized 2x2 */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl p-3 text-center hover-lift cursor-pointer"
            >
              <div className="text-2xl mb-1">🏋️</div>
              <div className="text-xl font-bold gradient-text">{stats.totalWorkouts}</div>
              <div className="text-xs text-gray-400">Тренировок</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl p-3 text-center hover-lift cursor-pointer"
            >
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold gradient-text">{stats.currentStreak}</div>
              <div className="text-xs text-gray-400">Дней подряд</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl p-3 text-center hover-lift cursor-pointer"
            >
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-xl font-bold gradient-text">{Math.floor(stats.totalTime / 60)}</div>
              <div className="text-xs text-gray-400">Часов</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl p-3 text-center hover-lift cursor-pointer"
            >
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold gradient-text">{stats.caloriesBurned}</div>
              <div className="text-xs text-gray-400">Калорий</div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Actions - Mobile optimized vertical stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-4 cursor-pointer hover:border-purple-500/50 border border-transparent transition-all flex items-center justify-between"
            onClick={() => window.location.href = '/workout'}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Силовая тренировка</h3>
                <p className="text-gray-400 text-xs">Развивайте силу и массу</p>
              </div>
            </div>
            <span className="text-purple-400">→</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-4 cursor-pointer hover:border-blue-500/50 border border-transparent transition-all flex items-center justify-between"
            onClick={() => window.location.href = '/workout'}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏃</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Кардио</h3>
                <p className="text-gray-400 text-xs">Сжигайте калории</p>
              </div>
            </div>
            <span className="text-blue-400">→</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-4 cursor-pointer hover:border-green-500/50 border border-transparent transition-all flex items-center justify-between"
            onClick={() => window.location.href = '/workout'}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧘</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Йога и растяжка</h3>
                <p className="text-gray-400 text-xs">Развивайте гибкость</p>
              </div>
            </div>
            <span className="text-green-400">→</span>
          </motion.div>
        </motion.div>

        {/* Progress Section - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass rounded-2xl p-5 mb-6"
        >
          <h3 className="text-lg font-bold mb-4">Ваш прогресс</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-xs">Недельная цель</span>
                <span className="font-semibold text-xs">5/7</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '71%' }}
                  transition={{ duration: 1, delay: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-xs">Месячная активность</span>
                <span className="font-semibold text-xs">18/30</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Motivational Quote - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center py-4"
        >
          <p className="text-sm text-gray-400 italic px-4">
            "Сила не приходит от физических способностей. Она приходит от несгибаемой воли."
          </p>
          <p className="text-xs text-gray-500 mt-1">- Махатма Ганди</p>
        </motion.div>
      </div>
    </div>
  );
};