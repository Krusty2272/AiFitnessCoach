import workoutStorage from './workoutStorage';
import particleService from './particleService';
import soundService from './soundService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'social' | 'special' | 'seasonal';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  canLose: boolean; // Может ли достижение исчезнуть
  loseCondition?: string; // Условие потери достижения
}

class AchievementService {
  private achievements: Achievement[] = [];
  private lastCheckDate: string = '';
  private consecutiveDaysOff: number = 0;

  constructor() {
    this.initializeAchievements();
    this.loadProgress();
    this.checkAchievements();
  }

  private initializeAchievements() {
    this.achievements = [
      // Достижения тренировок
      {
        id: 'first_workout',
        title: 'Первый шаг',
        description: 'Завершите первую тренировку',
        icon: '🎯',
        category: 'workout',
        requirement: 1,
        currentProgress: 0,
        unlocked: false,
        rarity: 'common',
        points: 10,
        canLose: false
      },
      {
        id: 'workout_10',
        title: 'Разминаемся',
        description: 'Завершите 10 тренировок',
        icon: '💪',
        category: 'workout',
        requirement: 10,
        currentProgress: 0,
        unlocked: false,
        rarity: 'common',
        points: 25,
        canLose: false
      },
      {
        id: 'workout_50',
        title: 'Фитнес-энтузиаст',
        description: 'Завершите 50 тренировок',
        icon: '🏋️',
        category: 'workout',
        requirement: 50,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 100,
        canLose: false
      },
      {
        id: 'workout_100',
        title: 'Железный человек',
        description: 'Завершите 100 тренировок',
        icon: '🦾',
        category: 'workout',
        requirement: 100,
        currentProgress: 0,
        unlocked: false,
        rarity: 'epic',
        points: 250,
        canLose: false
      },
      
      // Достижения стрика (могут исчезнуть!)
      {
        id: 'streak_3',
        title: 'Три дня подряд',
        description: 'Тренируйтесь 3 дня подряд',
        icon: '🔥',
        category: 'streak',
        requirement: 3,
        currentProgress: 0,
        unlocked: false,
        rarity: 'common',
        points: 15,
        canLose: true,
        loseCondition: 'Пропустите день тренировки'
      },
      {
        id: 'streak_7',
        title: 'Недельный воин',
        description: 'Тренируйтесь 7 дней подряд',
        icon: '⚡',
        category: 'streak',
        requirement: 7,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 50,
        canLose: true,
        loseCondition: 'Пропустите день тренировки'
      },
      {
        id: 'streak_30',
        title: 'Месячный марафон',
        description: 'Тренируйтесь 30 дней подряд',
        icon: '🏆',
        category: 'streak',
        requirement: 30,
        currentProgress: 0,
        unlocked: false,
        rarity: 'epic',
        points: 200,
        canLose: true,
        loseCondition: 'Пропустите день тренировки'
      },
      {
        id: 'streak_100',
        title: 'Легенда дисциплины',
        description: 'Тренируйтесь 100 дней подряд',
        icon: '👑',
        category: 'streak',
        requirement: 100,
        currentProgress: 0,
        unlocked: false,
        rarity: 'legendary',
        points: 1000,
        canLose: true,
        loseCondition: 'Пропустите день тренировки'
      },
      
      // Социальные достижения
      {
        id: 'first_friend',
        title: 'Не одинок',
        description: 'Добавьте первого друга',
        icon: '🤝',
        category: 'social',
        requirement: 1,
        currentProgress: 0,
        unlocked: false,
        rarity: 'common',
        points: 20,
        canLose: false
      },
      {
        id: 'social_butterfly',
        title: 'Душа компании',
        description: 'Добавьте 10 друзей',
        icon: '🦋',
        category: 'social',
        requirement: 10,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 75,
        canLose: false
      },
      {
        id: 'challenge_winner',
        title: 'Победитель',
        description: 'Выиграйте челлендж',
        icon: '🥇',
        category: 'social',
        requirement: 1,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 100,
        canLose: false
      },
      
      // Специальные достижения (могут исчезнуть!)
      {
        id: 'morning_bird',
        title: 'Ранняя пташка',
        description: 'Тренируйтесь до 7 утра 5 раз',
        icon: '🌅',
        category: 'special',
        requirement: 5,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 60,
        canLose: true,
        loseCondition: 'Не тренируйтесь утром 2 недели'
      },
      {
        id: 'night_owl',
        title: 'Ночная сова',
        description: 'Тренируйтесь после 22:00 5 раз',
        icon: '🦉',
        category: 'special',
        requirement: 5,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: 60,
        canLose: true,
        loseCondition: 'Не тренируйтесь вечером 2 недели'
      },
      {
        id: 'calorie_burner',
        title: 'Сжигатель калорий',
        description: 'Сожгите 10000 калорий',
        icon: '🔥',
        category: 'special',
        requirement: 10000,
        currentProgress: 0,
        unlocked: false,
        rarity: 'epic',
        points: 300,
        canLose: false
      },
      
      // Негативные достижения (появляются при пропуске)
      {
        id: 'lazy_week',
        title: 'Ленивая неделя',
        description: 'Не тренировались 7 дней',
        icon: '😴',
        category: 'special',
        requirement: 7,
        currentProgress: 0,
        unlocked: false,
        rarity: 'common',
        points: -50,
        canLose: false // Это "антидостижение"
      },
      {
        id: 'lost_way',
        title: 'Потерял путь',
        description: 'Не тренировались 30 дней',
        icon: '❌',
        category: 'special',
        requirement: 30,
        currentProgress: 0,
        unlocked: false,
        rarity: 'rare',
        points: -200,
        canLose: false
      }
    ];
  }

  private loadProgress() {
    const saved = localStorage.getItem('achievements');
    const lastCheck = localStorage.getItem('lastAchievementCheck');
    const daysOff = localStorage.getItem('consecutiveDaysOff');
    
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      this.achievements = this.achievements.map(achievement => {
        const saved = savedAchievements.find((a: Achievement) => a.id === achievement.id);
        return saved ? { ...achievement, ...saved } : achievement;
      });
    }
    
    this.lastCheckDate = lastCheck || new Date().toISOString().split('T')[0];
    this.consecutiveDaysOff = daysOff ? parseInt(daysOff) : 0;
  }

  private saveProgress() {
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
    localStorage.setItem('lastAchievementCheck', this.lastCheckDate);
    localStorage.setItem('consecutiveDaysOff', this.consecutiveDaysOff.toString());
  }

  checkAchievements(): Achievement[] {
    const stats = workoutStorage.getUserStats();
    const today = new Date().toISOString().split('T')[0];
    const unlockedNow: Achievement[] = [];
    
    // Проверяем, тренировался ли пользователь сегодня
    const todayWorkout = workoutStorage.getWorkoutHistory()
      .find(w => w.date === today && w.completed);
    
    // Обновляем счетчик дней без тренировок
    if (today !== this.lastCheckDate) {
      if (!todayWorkout) {
        this.consecutiveDaysOff++;
      } else {
        this.consecutiveDaysOff = 0;
      }
      this.lastCheckDate = today;
    }
    
    this.achievements.forEach(achievement => {
      const wasUnlocked = achievement.unlocked;
      
      switch (achievement.id) {
        // Достижения тренировок
        case 'first_workout':
        case 'workout_10':
        case 'workout_50':
        case 'workout_100':
          achievement.currentProgress = stats.totalWorkouts;
          break;
          
        // Достижения стрика
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
        case 'streak_100':
          achievement.currentProgress = stats.currentStreak;
          
          // Проверяем потерю достижения
          if (achievement.unlocked && achievement.canLose) {
            if (stats.currentStreak < achievement.requirement) {
              achievement.unlocked = false;
              achievement.unlockedAt = undefined;
              this.showAchievementLost(achievement);
            }
          }
          break;
          
        // Негативные достижения
        case 'lazy_week':
          achievement.currentProgress = this.consecutiveDaysOff;
          break;
          
        case 'lost_way':
          achievement.currentProgress = this.consecutiveDaysOff;
          break;
          
        // Калории
        case 'calorie_burner':
          achievement.currentProgress = stats.totalCalories;
          break;
      }
      
      // Проверяем разблокировку
      if (!achievement.unlocked && achievement.currentProgress >= achievement.requirement) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        
        if (!wasUnlocked) {
          unlockedNow.push(achievement);
          this.showAchievementUnlocked(achievement);
        }
      }
    });
    
    this.saveProgress();
    return unlockedNow;
  }

  private showAchievementUnlocked(achievement: Achievement) {
    // Звук и эффекты для разблокировки
    soundService.playWorkoutComplete();
    
    // Разные эффекты в зависимости от редкости
    switch (achievement.rarity) {
      case 'legendary':
        particleService.confetti({
          particleCount: 200,
          spread: 120,
          origin: { x: 0.5, y: 0.5 }
        });
        particleService.emojiExplosion('👑', window.innerWidth / 2, 100, 20);
        break;
      case 'epic':
        particleService.confetti({
          particleCount: 100,
          spread: 90
        });
        particleService.stars(window.innerWidth / 2, 150);
        break;
      case 'rare':
        particleService.stars(window.innerWidth / 2, 150);
        break;
      default:
        particleService.emojiExplosion(achievement.icon, window.innerWidth / 2, 150, 8);
    }
    
    // Показываем уведомление
    this.showNotification(
      `🎉 Достижение разблокировано!`,
      `${achievement.icon} ${achievement.title}`,
      achievement.rarity
    );
  }

  private showAchievementLost(achievement: Achievement) {
    // Звук и эффекты для потери
    soundService.playWarning();
    
    // Показываем уведомление
    this.showNotification(
      `😔 Достижение потеряно`,
      `${achievement.icon} ${achievement.title} - ${achievement.loseCondition}`,
      'lost'
    );
  }

  private showNotification(title: string, message: string, type: string) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'legendary' ? 'linear-gradient(135deg, #ffd700, #ffed4e)' :
                   type === 'epic' ? 'linear-gradient(135deg, #9333ea, #c084fc)' :
                   type === 'rare' ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' :
                   type === 'lost' ? 'linear-gradient(135deg, #ef4444, #f87171)' :
                   'linear-gradient(135deg, #667eea, #764ba2)'};
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideDown 0.5s ease-out;
      max-width: 300px;
      text-align: center;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
      <div style="font-size: 14px;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.5s ease-out';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getTotalPoints(): number {
    return this.achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
  }

  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  getProgress(): {
    total: number;
    unlocked: number;
    percentage: number;
    points: number;
  } {
    const total = this.achievements.filter(a => a.points > 0).length;
    const unlocked = this.achievements.filter(a => a.unlocked && a.points > 0).length;
    
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      points: this.getTotalPoints()
    };
  }

  // Метод для проверки утренних/вечерних тренировок
  checkTimeBasedAchievements(): void {
    const hour = new Date().getHours();
    
    if (hour < 7) {
      const morning = this.achievements.find(a => a.id === 'morning_bird');
      if (morning) {
        morning.currentProgress++;
        this.checkAchievements();
      }
    } else if (hour >= 22) {
      const night = this.achievements.find(a => a.id === 'night_owl');
      if (night) {
        night.currentProgress++;
        this.checkAchievements();
      }
    }
  }

  // Метод для обновления социальных достижений
  updateSocialProgress(type: 'friends' | 'challenges', count: number): void {
    if (type === 'friends') {
      const friendAchievements = ['first_friend', 'social_butterfly'];
      friendAchievements.forEach(id => {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement) {
          achievement.currentProgress = count;
        }
      });
    } else if (type === 'challenges') {
      const achievement = this.achievements.find(a => a.id === 'challenge_winner');
      if (achievement) {
        achievement.currentProgress = count;
      }
    }
    
    this.checkAchievements();
  }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default new AchievementService();