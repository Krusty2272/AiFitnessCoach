export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  avatarCategory: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarOption {
  emoji: string;
  category: string;
  name: string;
  requiredLevel?: number;
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    name: string;
  };
}

class UserProfileService {
  private profile: UserProfile | null = null;

  // Библиотека аватарок по категориям
  private readonly avatarLibrary: Record<string, AvatarOption[]> = {
    sport: [
      { emoji: '💪', category: 'sport', name: 'Сильный' },
      { emoji: '🏃', category: 'sport', name: 'Бегун' },
      { emoji: '🏋️', category: 'sport', name: 'Тяжелоатлет' },
      { emoji: '🤸', category: 'sport', name: 'Гимнаст' },
      { emoji: '🚴', category: 'sport', name: 'Велосипедист' },
      { emoji: '🏊', category: 'sport', name: 'Пловец' },
      { emoji: '🧘', category: 'sport', name: 'Йог' },
      { emoji: '🤾', category: 'sport', name: 'Спортсмен' },
      { emoji: '⛹️', category: 'sport', name: 'Баскетболист' },
      { emoji: '🏌️', category: 'sport', name: 'Гольфист' }
    ],
    people: [
      { emoji: '😎', category: 'people', name: 'Крутой' },
      { emoji: '🥷', category: 'people', name: 'Ниндзя' },
      { emoji: '👨‍🎤', category: 'people', name: 'Рокер' },
      { emoji: '🧑‍💻', category: 'people', name: 'Программист' },
      { emoji: '👨‍🚀', category: 'people', name: 'Астронавт' },
      { emoji: '🦸', category: 'people', name: 'Супергерой' },
      { emoji: '🧙', category: 'people', name: 'Волшебник' },
      { emoji: '👑', category: 'people', name: 'Король' },
      { emoji: '🎅', category: 'people', name: 'Санта' },
      { emoji: '🧛', category: 'people', name: 'Вампир' }
    ],
    animals: [
      { emoji: '🦁', category: 'animals', name: 'Лев' },
      { emoji: '🐺', category: 'animals', name: 'Волк' },
      { emoji: '🦅', category: 'animals', name: 'Орёл' },
      { emoji: '🐉', category: 'animals', name: 'Дракон' },
      { emoji: '🦈', category: 'animals', name: 'Акула' },
      { emoji: '🐅', category: 'animals', name: 'Тигр' },
      { emoji: '🦍', category: 'animals', name: 'Горилла' },
      { emoji: '🐻', category: 'animals', name: 'Медведь' },
      { emoji: '🦊', category: 'animals', name: 'Лиса' },
      { emoji: '🦝', category: 'animals', name: 'Енот' }
    ],
    fun: [
      { emoji: '🎯', category: 'fun', name: 'Цель' },
      { emoji: '🚀', category: 'fun', name: 'Ракета' },
      { emoji: '⚡', category: 'fun', name: 'Молния' },
      { emoji: '🔥', category: 'fun', name: 'Огонь' },
      { emoji: '💎', category: 'fun', name: 'Алмаз' },
      { emoji: '🌟', category: 'fun', name: 'Звезда' },
      { emoji: '🎮', category: 'fun', name: 'Геймер' },
      { emoji: '🎸', category: 'fun', name: 'Гитара' },
      { emoji: '🎨', category: 'fun', name: 'Художник' },
      { emoji: '🎭', category: 'fun', name: 'Театр' }
    ],
    nature: [
      { emoji: '🌈', category: 'nature', name: 'Радуга' },
      { emoji: '🌸', category: 'nature', name: 'Сакура' },
      { emoji: '🌺', category: 'nature', name: 'Гибискус' },
      { emoji: '🌻', category: 'nature', name: 'Подсолнух' },
      { emoji: '🌴', category: 'nature', name: 'Пальма' },
      { emoji: '🌵', category: 'nature', name: 'Кактус' },
      { emoji: '🍄', category: 'nature', name: 'Гриб' },
      { emoji: '🌙', category: 'nature', name: 'Луна' },
      { emoji: '☀️', category: 'nature', name: 'Солнце' },
      { emoji: '⭐', category: 'nature', name: 'Звезда' }
    ],
    food: [
      { emoji: '🍕', category: 'food', name: 'Пицца' },
      { emoji: '🍔', category: 'food', name: 'Бургер' },
      { emoji: '🥑', category: 'food', name: 'Авокадо' },
      { emoji: '🍎', category: 'food', name: 'Яблоко' },
      { emoji: '🥦', category: 'food', name: 'Брокколи' },
      { emoji: '🥕', category: 'food', name: 'Морковь' },
      { emoji: '🍓', category: 'food', name: 'Клубника' },
      { emoji: '🍉', category: 'food', name: 'Арбуз' },
      { emoji: '🥥', category: 'food', name: 'Кокос' },
      { emoji: '🍋', category: 'food', name: 'Лимон' }
    ],
    emoji: [
      { emoji: '😈', category: 'emoji', name: 'Дьявол' },
      { emoji: '👻', category: 'emoji', name: 'Призрак' },
      { emoji: '👽', category: 'emoji', name: 'Пришелец' },
      { emoji: '🤖', category: 'emoji', name: 'Робот' },
      { emoji: '💀', category: 'emoji', name: 'Череп' },
      { emoji: '🎃', category: 'emoji', name: 'Тыква' },
      { emoji: '🤡', category: 'emoji', name: 'Клоун' },
      { emoji: '👹', category: 'emoji', name: 'Огр' },
      { emoji: '👺', category: 'emoji', name: 'Гоблин' },
      { emoji: '🗿', category: 'emoji', name: 'Моаи' }
    ],
    premium: [
      { 
        emoji: '⭐', 
        category: 'premium', 
        name: 'Star', 
        requiredLevel: 10,
        theme: {
          primary: '#ffd700',
          secondary: '#ffed4e',
          background: '#1a1a2e',
          accent: '#ffa500',
          name: 'golden-star'
        }
      },
      { 
        emoji: '⚡', 
        category: 'premium', 
        name: 'Lightning', 
        requiredLevel: 15,
        theme: {
          primary: '#00d4ff',
          secondary: '#0099cc',
          background: '#0f0f1e',
          accent: '#00ffff',
          name: 'electric-blue'
        }
      },
      { 
        emoji: '💎', 
        category: 'premium', 
        name: 'Diamond', 
        requiredLevel: 20,
        theme: {
          primary: '#b9f2ff',
          secondary: '#00d4ff',
          background: '#0a0e27',
          accent: '#00ffff',
          name: 'diamond-ice'
        }
      },
      { 
        emoji: '👑', 
        category: 'premium', 
        name: 'Crown', 
        requiredLevel: 25,
        theme: {
          primary: '#ffd700',
          secondary: '#daa520',
          background: '#1a0f0a',
          accent: '#ff6b35',
          name: 'royal-gold'
        }
      },
      { 
        emoji: '🏆', 
        category: 'premium', 
        name: 'Champion', 
        requiredLevel: 30,
        theme: {
          primary: '#ff6b35',
          secondary: '#ff9558',
          background: '#1a0e0e',
          accent: '#ffd700',
          name: 'champion-bronze'
        }
      },
      { 
        emoji: '🔥', 
        category: 'premium', 
        name: 'Phoenix', 
        requiredLevel: 40,
        theme: {
          primary: '#ff4500',
          secondary: '#ff6347',
          background: '#1a0a0a',
          accent: '#ffd700',
          name: 'phoenix-flame'
        }
      },
      { 
        emoji: '🌌', 
        category: 'premium', 
        name: 'Galaxy', 
        requiredLevel: 50,
        theme: {
          primary: '#9945ff',
          secondary: '#ff00ff',
          background: '#0a0015',
          accent: '#00ffff',
          name: 'cosmic-galaxy'
        }
      },
      { 
        emoji: '✨', 
        category: 'premium', 
        name: 'Legendary', 
        requiredLevel: 75,
        theme: {
          primary: '#ff00ff',
          secondary: '#00ffff',
          background: '#000000',
          accent: '#ffd700',
          name: 'legendary-prism'
        }
      },
      { 
        emoji: '🌈', 
        category: 'premium', 
        name: 'Mythic', 
        requiredLevel: 100,
        theme: {
          primary: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)',
          secondary: 'linear-gradient(45deg, #8b00ff, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000)',
          background: '#0a0a0a',
          accent: '#ffffff',
          name: 'mythic-rainbow'
        }
      }
    ]
  };

  constructor() {
    this.loadProfile();
  }

  private loadProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      this.profile = JSON.parse(saved);
    } else {
      // Создаем профиль по умолчанию
      this.profile = {
        id: `user_${Date.now()}`,
        nickname: 'Спортсмен',
        avatar: '💪',
        avatarCategory: 'sport',
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.saveProfile();
    }
  }

  private saveProfile() {
    if (this.profile) {
      localStorage.setItem('userProfile', JSON.stringify(this.profile));
    }
  }

  // Получить текущий профиль
  getProfile(): UserProfile {
    if (!this.profile) {
      this.loadProfile();
    }
    return this.profile!;
  }

  // Обновить никнейм
  updateNickname(nickname: string): boolean {
    if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
      return false;
    }

    if (this.profile) {
      this.profile.nickname = nickname.trim();
      this.profile.updatedAt = new Date().toISOString();
      this.saveProfile();
      return true;
    }
    return false;
  }

  // Обновить аватар
  updateAvatar(avatar: string, category: string): boolean {
    if (this.profile) {
      this.profile.avatar = avatar;
      this.profile.avatarCategory = category;
      this.profile.updatedAt = new Date().toISOString();
      this.saveProfile();
      
      // Применить тему аватарки если включена автоматическая смена
      const autoTheme = localStorage.getItem('autoAvatarTheme');
      if (autoTheme === 'true') {
        const avatarOption = this.findAvatarByEmoji(avatar);
        if (avatarOption?.theme) {
          this.applyAvatarTheme(avatarOption.theme);
        }
      }
      
      return true;
    }
    return false;
  }
  
  // Найти аватарку по эмодзи
  findAvatarByEmoji(emoji: string): AvatarOption | undefined {
    for (const category of Object.values(this.avatarLibrary)) {
      const avatar = category.find(a => a.emoji === emoji);
      if (avatar) return avatar;
    }
    return undefined;
  }
  
  // Применить тему аватарки
  applyAvatarTheme(theme: AvatarOption['theme']) {
    if (!theme) return;
    
    const root = document.documentElement;
    
    // Сохраняем текущую тему как тему аватарки
    localStorage.setItem('avatarTheme', JSON.stringify(theme));
    
    // Применяем CSS переменные
    if (theme.primary.includes('gradient')) {
      root.style.setProperty('--primary-gradient', theme.primary);
      // Извлекаем первый цвет из градиента для primary-color
      const firstColor = theme.primary.match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea';
      root.style.setProperty('--primary-color', firstColor);
    } else {
      root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
      root.style.setProperty('--primary-color', theme.primary);
    }
    
    if (theme.secondary.includes('gradient')) {
      const firstColor = theme.secondary.match(/#[a-fA-F0-9]{6}/)?.[0] || '#764ba2';
      root.style.setProperty('--secondary-color', firstColor);
    } else {
      root.style.setProperty('--secondary-color', theme.secondary);
    }
    
    root.style.setProperty('--background-primary', theme.background);
    root.style.setProperty('--accent-color', theme.accent);
    
    // Обновляем другие связанные цвета
    const isDark = this.isColorDark(theme.background);
    root.style.setProperty('--text-primary', isDark ? '#ffffff' : '#000000');
    root.style.setProperty('--text-secondary', isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)');
    root.style.setProperty('--background-secondary', isDark ? '#1a1a2e' : '#f5f5f5');
    root.style.setProperty('--background-card', isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)');
    root.style.setProperty('--border-color', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
  }
  
  // Определить, темный ли цвет
  isColorDark(color: string): boolean {
    // Убираем # и берем только hex часть
    const hex = color.replace('#', '').substring(0, 6);
    
    // Проверяем валидность hex
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return true; // По умолчанию считаем темным
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  }
  
  // Сбросить тему на дефолтную
  resetTheme() {
    localStorage.removeItem('avatarTheme');
    // Применяем тему из ThemeContext
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const event = new CustomEvent('themeReset', { detail: savedTheme });
    window.dispatchEvent(event);
  }

  // Обновить био
  updateBio(bio: string): boolean {
    if (bio.length > 150) {
      return false;
    }

    if (this.profile) {
      this.profile.bio = bio;
      this.profile.updatedAt = new Date().toISOString();
      this.saveProfile();
      return true;
    }
    return false;
  }

  // Получить все аватарки
  getAllAvatars(): Record<string, AvatarOption[]> {
    return this.avatarLibrary;
  }

  // Получить аватарки по категории
  getAvatarsByCategory(category: string): AvatarOption[] {
    return this.avatarLibrary[category] || [];
  }

  // Получить категории аватарок
  getAvatarCategories(): { id: string; name: string; icon: string }[] {
    return [
      { id: 'sport', name: 'Спорт', icon: '💪' },
      { id: 'people', name: 'Люди', icon: '😎' },
      { id: 'animals', name: 'Животные', icon: '🦁' },
      { id: 'fun', name: 'Веселье', icon: '🎯' },
      { id: 'nature', name: 'Природа', icon: '🌈' },
      { id: 'food', name: 'Еда', icon: '🍕' },
      { id: 'emoji', name: 'Эмодзи', icon: '😈' },
      { id: 'premium', name: 'Премиум', icon: '👑' }
    ];
  }

  // Проверить доступность конкретной аватарки
  isAvatarUnlocked(avatar: AvatarOption): boolean {
    if (!avatar.requiredLevel) return true;
    
    const levelData = JSON.parse(localStorage.getItem('levelData') || '{}');
    return levelData.currentLevel >= avatar.requiredLevel;
  }
  
  // Получить минимальный уровень для премиум аватарок
  getMinPremiumLevel(): number {
    return Math.min(...this.avatarLibrary.premium.map(a => a.requiredLevel || 0));
  }
  
  // Проверить доступность премиум категории
  isPremiumUnlocked(): boolean {
    const levelData = JSON.parse(localStorage.getItem('levelData') || '{}');
    return levelData.currentLevel >= this.getMinPremiumLevel();
  }

  // Валидация никнейма
  validateNickname(nickname: string): { valid: boolean; error?: string } {
    if (!nickname || nickname.trim().length === 0) {
      return { valid: false, error: 'Никнейм не может быть пустым' };
    }
    if (nickname.trim().length < 2) {
      return { valid: false, error: 'Никнейм слишком короткий (мин. 2 символа)' };
    }
    if (nickname.trim().length > 20) {
      return { valid: false, error: 'Никнейм слишком длинный (макс. 20 символов)' };
    }
    if (!/^[a-zA-Zа-яА-Я0-9_\s]+$/.test(nickname)) {
      return { valid: false, error: 'Используйте только буквы, цифры и _' };
    }
    return { valid: true };
  }

  // Генерация случайного никнейма
  generateRandomNickname(): string {
    const adjectives = ['Сильный', 'Быстрый', 'Умный', 'Храбрый', 'Ловкий', 'Могучий', 'Железный', 'Стальной'];
    const nouns = ['Воин', 'Атлет', 'Чемпион', 'Боец', 'Спортсмен', 'Герой', 'Титан', 'Викинг'];
    const number = Math.floor(Math.random() * 999);
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj}${noun}${number}`;
  }

  // Получить случайный аватар
  getRandomAvatar(): AvatarOption {
    const categories = Object.keys(this.avatarLibrary).filter(cat => cat !== 'premium' || this.isPremiumUnlocked());
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const avatars = this.avatarLibrary[randomCategory];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}

export default new UserProfileService();