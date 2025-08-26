import particleService from './particleService';
import soundService from './soundService';

export interface LevelData {
  level: number;
  currentXP: number;
  requiredXP: number;
  totalXP: number;
  rank: string;
  rankIcon: string;
  nextRank: string;
  progressPercentage: number;
}

export interface XPSource {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  multiplier?: number;
  timestamp?: string;
}

export interface DailyBonus {
  day: number;
  xp: number;
  claimed: boolean;
  date: string;
}

export interface XPMultiplier {
  type: 'streak' | 'time' | 'challenge' | 'friend' | 'event';
  value: number;
  description: string;
  active: boolean;
  expiresAt?: string;
}

class LevelService {
  private readonly BASE_XP = 100; // Базовый опыт для 2 уровня
  private readonly XP_MULTIPLIER = 1.5; // Множитель сложности для каждого уровня
  private currentLevel: number = 1;
  private currentXP: number = 0;
  private totalXP: number = 0;
  private dailyLoginStreak: number = 0;
  private lastLoginDate: string = '';
  private xpHistory: XPSource[] = [];
  private dailyBonuses: DailyBonus[] = [];
  private activeMultipliers: XPMultiplier[] = [];

  // Ранги и их требования
  private readonly ranks = [
    { min: 1, max: 4, name: 'Новичок', icon: '🌱' },
    { min: 5, max: 9, name: 'Ученик', icon: '📚' },
    { min: 10, max: 14, name: 'Спортсмен', icon: '🏃' },
    { min: 15, max: 19, name: 'Атлет', icon: '💪' },
    { min: 20, max: 29, name: 'Воин', icon: '⚔️' },
    { min: 30, max: 39, name: 'Мастер', icon: '🥋' },
    { min: 40, max: 49, name: 'Чемпион', icon: '🏆' },
    { min: 50, max: 69, name: 'Герой', icon: '🦸' },
    { min: 70, max: 99, name: 'Легенда', icon: '⭐' },
    { min: 100, max: 999, name: 'Бессмертный', icon: '👑' }
  ];

  // Источники опыта
  private readonly xpSources = {
    // Тренировки
    WORKOUT_COMPLETE: { base: 50, name: 'Тренировка завершена', icon: '💪' },
    PERFECT_WORKOUT: { base: 100, name: 'Идеальная тренировка', icon: '⭐' },
    FIRST_WORKOUT_DAY: { base: 30, name: 'Первая тренировка дня', icon: '🌅' },
    WORKOUT_STREAK_3: { base: 50, name: 'Серия 3 дня', icon: '🔥' },
    WORKOUT_STREAK_7: { base: 100, name: 'Серия 7 дней', icon: '⚡' },
    WORKOUT_STREAK_30: { base: 500, name: 'Серия 30 дней', icon: '🏆' },
    
    // Упражнения
    EXERCISE_COMPLETE: { base: 5, name: 'Упражнение выполнено', icon: '✅' },
    PERSONAL_RECORD: { base: 75, name: 'Личный рекорд', icon: '🎯' },
    ALL_SETS_COMPLETE: { base: 25, name: 'Все подходы выполнены', icon: '💯' },
    
    // Социальные
    FRIEND_ADDED: { base: 20, name: 'Друг добавлен', icon: '🤝' },
    CHALLENGE_WIN: { base: 150, name: 'Победа в челлендже', icon: '🥇' },
    CHALLENGE_PARTICIPATION: { base: 30, name: 'Участие в челлендже', icon: '🎮' },
    WORKOUT_SHARED: { base: 15, name: 'Результат опубликован', icon: '📱' },
    LIKE_RECEIVED: { base: 5, name: 'Получен лайк', icon: '❤️' },
    COMMENT_RECEIVED: { base: 10, name: 'Получен комментарий', icon: '💬' },
    
    // Ежедневные
    DAILY_LOGIN: { base: 10, name: 'Ежедневный вход', icon: '📅' },
    DAILY_BONUS_1: { base: 10, name: 'День 1', icon: '1️⃣' },
    DAILY_BONUS_2: { base: 20, name: 'День 2', icon: '2️⃣' },
    DAILY_BONUS_3: { base: 30, name: 'День 3', icon: '3️⃣' },
    DAILY_BONUS_4: { base: 40, name: 'День 4', icon: '4️⃣' },
    DAILY_BONUS_5: { base: 50, name: 'День 5', icon: '5️⃣' },
    DAILY_BONUS_6: { base: 60, name: 'День 6', icon: '6️⃣' },
    DAILY_BONUS_7: { base: 100, name: 'Неделя входов', icon: '7️⃣' },
    
    // Достижения
    ACHIEVEMENT_UNLOCK: { base: 50, name: 'Достижение разблокировано', icon: '🏅' },
    RARE_ACHIEVEMENT: { base: 100, name: 'Редкое достижение', icon: '💎' },
    EPIC_ACHIEVEMENT: { base: 200, name: 'Эпическое достижение', icon: '🔮' },
    LEGENDARY_ACHIEVEMENT: { base: 500, name: 'Легендарное достижение', icon: '👑' },
    
    // Специальные
    MORNING_WORKOUT: { base: 25, name: 'Утренняя тренировка', icon: '🌅' },
    EVENING_WORKOUT: { base: 25, name: 'Вечерняя тренировка', icon: '🌙' },
    WEEKEND_WARRIOR: { base: 40, name: 'Тренировка в выходные', icon: '🎉' },
    COMEBACK: { base: 100, name: 'Возвращение после перерыва', icon: '💫' },
    MILESTONE_10_WORKOUTS: { base: 100, name: '10 тренировок', icon: '🎯' },
    MILESTONE_50_WORKOUTS: { base: 500, name: '50 тренировок', icon: '🏆' },
    MILESTONE_100_WORKOUTS: { base: 1000, name: '100 тренировок', icon: '💯' }
  };

  constructor() {
    this.loadData();
    this.checkDailyLogin();
  }

  private loadData() {
    const savedData = localStorage.getItem('levelData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.currentLevel = data.currentLevel || 1;
      this.currentXP = data.currentXP || 0;
      this.totalXP = data.totalXP || 0;
      this.dailyLoginStreak = data.dailyLoginStreak || 0;
      this.lastLoginDate = data.lastLoginDate || '';
      this.xpHistory = data.xpHistory || [];
      this.dailyBonuses = data.dailyBonuses || [];
      this.activeMultipliers = data.activeMultipliers || [];
    }
  }

  private saveData() {
    const data = {
      currentLevel: this.currentLevel,
      currentXP: this.currentXP,
      totalXP: this.totalXP,
      dailyLoginStreak: this.dailyLoginStreak,
      lastLoginDate: this.lastLoginDate,
      xpHistory: this.xpHistory.slice(-100), // Сохраняем только последние 100 записей
      dailyBonuses: this.dailyBonuses,
      activeMultipliers: this.activeMultipliers
    };
    localStorage.setItem('levelData', JSON.stringify(data));
  }

  // Расчет необходимого опыта для уровня
  private calculateRequiredXP(level: number): number {
    if (level === 1) return this.BASE_XP;
    return Math.floor(this.BASE_XP * Math.pow(this.XP_MULTIPLIER, level - 1));
  }

  // Получение текущего ранга
  private getCurrentRank() {
    const rank = this.ranks.find(r => this.currentLevel >= r.min && this.currentLevel <= r.max);
    return rank || this.ranks[0];
  }

  // Добавление опыта с учетом множителей
  addXP(sourceKey: keyof typeof this.xpSources, customMultiplier: number = 1): number {
    const source = this.xpSources[sourceKey];
    if (!source) return 0;

    // Расчет итогового множителя
    let totalMultiplier = customMultiplier;
    
    // Применяем активные множители
    this.activeMultipliers.forEach(mult => {
      if (mult.active) {
        totalMultiplier *= mult.value;
      }
    });

    // Бонус за высокий стрик
    if (this.dailyLoginStreak >= 7) {
      totalMultiplier *= 1.2;
    } else if (this.dailyLoginStreak >= 3) {
      totalMultiplier *= 1.1;
    }

    // Бонус выходного дня
    const today = new Date().getDay();
    if (today === 0 || today === 6) {
      totalMultiplier *= 1.5;
    }

    // Время суток
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 8) {
      totalMultiplier *= 1.3; // Утренний бонус
    } else if (hour >= 20 && hour <= 23) {
      totalMultiplier *= 1.2; // Вечерний бонус
    }

    const finalXP = Math.floor(source.base * totalMultiplier);

    // Добавляем в историю
    this.xpHistory.push({
      id: `xp_${Date.now()}`,
      name: source.name,
      description: `+${finalXP} XP`,
      xp: finalXP,
      icon: source.icon,
      multiplier: totalMultiplier,
      timestamp: new Date().toISOString()
    });

    // Обновляем опыт
    this.currentXP += finalXP;
    this.totalXP += finalXP;

    // Проверяем повышение уровня
    while (this.currentXP >= this.calculateRequiredXP(this.currentLevel)) {
      this.levelUp();
    }

    this.saveData();
    this.showXPGain(source.name, finalXP, source.icon);
    
    return finalXP;
  }

  // Повышение уровня
  private levelUp() {
    const requiredXP = this.calculateRequiredXP(this.currentLevel);
    this.currentXP -= requiredXP;
    this.currentLevel++;

    const newRank = this.getCurrentRank();
    
    // Эффекты повышения уровня
    soundService.playWorkoutComplete();
    particleService.confetti({
      particleCount: 100,
      spread: 90,
      origin: { x: 0.5, y: 0.5 }
    });
    
    // Особые эффекты для важных уровней
    if (this.currentLevel % 10 === 0) {
      particleService.emojiExplosion('🎉', window.innerWidth / 2, 150, 20);
    }

    this.showLevelUp(this.currentLevel, newRank);
  }

  // Ежедневный вход
  private checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.lastLoginDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (this.lastLoginDate === yesterdayStr) {
        // Продолжаем стрик
        this.dailyLoginStreak++;
      } else if (this.lastLoginDate === '') {
        // Первый вход
        this.dailyLoginStreak = 1;
      } else {
        // Стрик прерван
        this.dailyLoginStreak = 1;
        this.dailyBonuses = []; // Сбрасываем ежедневные бонусы
      }

      this.lastLoginDate = today;
      
      // Даем опыт за ежедневный вход
      this.addXP('DAILY_LOGIN');
      
      // Даем бонус за стрик
      if (this.dailyLoginStreak <= 7) {
        const bonusKey = `DAILY_BONUS_${this.dailyLoginStreak}` as keyof typeof this.xpSources;
        if (this.xpSources[bonusKey]) {
          this.addXP(bonusKey);
        }
      }

      this.saveData();
    }
  }

  // Отображение получения опыта
  private showXPGain(source: string, xp: number, icon: string) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
      z-index: 10000;
      animation: slideInRight 0.5s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: bold;
    `;

    notification.innerHTML = `
      <span style="font-size: 20px;">${icon}</span>
      <div>
        <div>+${xp} XP</div>
        <div style="font-size: 11px; opacity: 0.9;">${source}</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease-out';
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }

  // Отображение повышения уровня
  private showLevelUp(level: number, rank: any) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        color: white;
        max-width: 300px;
        animation: bounceIn 0.5s ease-out;
      ">
        <div style="font-size: 60px; margin-bottom: 20px; animation: pulse 1s ease-in-out infinite;">
          ${rank.icon}
        </div>
        <h2 style="font-size: 28px; margin-bottom: 10px;">Уровень ${level}!</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">${rank.name}</p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        ">
          Отлично!
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => modal.remove(), 300);
    }, 3000);
  }

  // Публичные методы
  getLevelData(): LevelData {
    const requiredXP = this.calculateRequiredXP(this.currentLevel);
    const currentRank = this.getCurrentRank();
    const nextRank = this.ranks.find(r => r.min > this.currentLevel) || currentRank;

    return {
      level: this.currentLevel,
      currentXP: this.currentXP,
      requiredXP,
      totalXP: this.totalXP,
      rank: currentRank.name,
      rankIcon: currentRank.icon,
      nextRank: nextRank.name,
      progressPercentage: (this.currentXP / requiredXP) * 100
    };
  }

  getXPHistory(): XPSource[] {
    return this.xpHistory.slice(-20); // Последние 20 записей
  }

  getDailyStreak(): number {
    return this.dailyLoginStreak;
  }

  // Добавление временного множителя
  addMultiplier(type: XPMultiplier['type'], value: number, durationMinutes: number, description: string) {
    const multiplier: XPMultiplier = {
      type,
      value,
      description,
      active: true,
      expiresAt: new Date(Date.now() + durationMinutes * 60000).toISOString()
    };

    this.activeMultipliers.push(multiplier);
    this.saveData();

    // Удаляем по истечении
    setTimeout(() => {
      this.activeMultipliers = this.activeMultipliers.filter(m => m !== multiplier);
      this.saveData();
    }, durationMinutes * 60000);
  }

  getActiveMultipliers(): XPMultiplier[] {
    // Очищаем истекшие множители
    const now = new Date().toISOString();
    this.activeMultipliers = this.activeMultipliers.filter(m => 
      !m.expiresAt || m.expiresAt > now
    );
    return this.activeMultipliers;
  }

  // Специальные методы для разных событий
  onWorkoutComplete(duration: number, exercises: number, calories: number) {
    let totalXP = this.addXP('WORKOUT_COMPLETE');

    // Бонусы за качество тренировки
    if (duration >= 30) {
      totalXP += this.addXP('PERFECT_WORKOUT', 0.5);
    }

    // Утренняя или вечерняя тренировка
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 8) {
      totalXP += this.addXP('MORNING_WORKOUT');
    } else if (hour >= 20 && hour <= 23) {
      totalXP += this.addXP('EVENING_WORKOUT');
    }

    // Выходные
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      totalXP += this.addXP('WEEKEND_WARRIOR');
    }

    return totalXP;
  }

  onChallengeComplete(position: number) {
    if (position === 1) {
      return this.addXP('CHALLENGE_WIN');
    } else {
      return this.addXP('CHALLENGE_PARTICIPATION');
    }
  }

  onSocialInteraction(type: 'like' | 'comment' | 'share' | 'friend') {
    switch(type) {
      case 'like':
        return this.addXP('LIKE_RECEIVED');
      case 'comment':
        return this.addXP('COMMENT_RECEIVED');
      case 'share':
        return this.addXP('WORKOUT_SHARED');
      case 'friend':
        return this.addXP('FRIEND_ADDED');
      default:
        return 0;
    }
  }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

export default new LevelService();