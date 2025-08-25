class SoundService {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;

  constructor() {
    // Загружаем настройки из localStorage
    const settings = localStorage.getItem('soundSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.soundEnabled = parsed.soundEnabled ?? true;
      this.vibrationEnabled = parsed.vibrationEnabled ?? true;
    }
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Воспроизвести звук с заданной частотой
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.soundEnabled) return;
    
    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Вибрация
  private vibrate(pattern: number | number[]) {
    if (!this.vibrationEnabled) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Звук начала упражнения
  playExerciseStart() {
    this.playTone(880, 0.2); // A5 note
    this.vibrate(100);
  }

  // Звук окончания упражнения
  playExerciseComplete() {
    this.playTone(523, 0.15); // C5
    setTimeout(() => this.playTone(659, 0.15), 150); // E5
    setTimeout(() => this.playTone(784, 0.2), 300); // G5
    this.vibrate([100, 50, 100]);
  }

  // Звук начала отдыха
  playRestStart() {
    this.playTone(440, 0.3); // A4
    this.vibrate(200);
  }

  // Звук окончания отдыха
  playRestEnd() {
    this.playTone(660, 0.1); // E5
    setTimeout(() => this.playTone(880, 0.15), 100); // A5
    this.vibrate([50, 50, 50]);
  }

  // Обратный отсчет (3-2-1)
  playCountdown(number: number) {
    const frequencies = {
      3: 440, // A4
      2: 523, // C5
      1: 659, // E5
      0: 784  // G5 (старт)
    };
    
    const frequency = frequencies[number as keyof typeof frequencies] || 440;
    this.playTone(frequency, 0.15);
    
    if (number === 0) {
      this.vibrate([100, 50, 100, 50, 100]);
    } else {
      this.vibrate(50);
    }
  }

  // Звук предупреждения (за 3 секунды до конца)
  playWarning() {
    this.playTone(660, 0.1);
    setTimeout(() => this.playTone(660, 0.1), 150);
    this.vibrate([50, 50]);
  }

  // Звук завершения тренировки
  playWorkoutComplete() {
    // Победная мелодия
    const notes = [
      { freq: 523, delay: 0 },    // C5
      { freq: 659, delay: 150 },  // E5
      { freq: 784, delay: 300 },  // G5
      { freq: 1047, delay: 450 }, // C6
    ];
    
    notes.forEach(note => {
      setTimeout(() => this.playTone(note.freq, 0.2, 0.4), note.delay);
    });
    
    this.vibrate([200, 100, 200, 100, 400]);
  }

  // Звук нажатия кнопки
  playClick() {
    this.playTone(1000, 0.05, 0.1);
    this.vibrate(10);
  }

  // Включить/выключить звук
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveSettings();
    return this.soundEnabled;
  }

  // Включить/выключить вибрацию
  toggleVibration() {
    this.vibrationEnabled = !this.vibrationEnabled;
    this.saveSettings();
    return this.vibrationEnabled;
  }

  // Получить текущие настройки
  getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled
    };
  }

  // Установить настройки
  setSettings(soundEnabled: boolean, vibrationEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    this.vibrationEnabled = vibrationEnabled;
    this.saveSettings();
  }

  // Сохранить настройки в localStorage
  private saveSettings() {
    localStorage.setItem('soundSettings', JSON.stringify({
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled
    }));
  }

  // Тестовый звук для проверки
  playTestSound() {
    this.playTone(440, 0.2);
    this.vibrate(100);
  }
}

export default new SoundService();