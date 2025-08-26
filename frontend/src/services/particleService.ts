class ParticleService {
  private container: HTMLDivElement | null = null;

  constructor() {
    this.initContainer();
  }

  private initContainer() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.container);
  }

  // Конфетти для празднования достижений
  confetti(options: {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    origin?: { x: number; y: number };
    colors?: string[];
  } = {}) {
    const {
      particleCount = 50,
      spread = 70,
      startVelocity = 30,
      origin = { x: 0.5, y: 0.5 },
      colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    } = options;

    if (!this.container) return;

    for (let i = 0; i < particleCount; i++) {
      this.createConfettiParticle(origin, spread, startVelocity, colors);
    }
  }

  private createConfettiParticle(
    origin: { x: number; y: number },
    spread: number,
    startVelocity: number,
    colors: string[]
  ) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const angle = Math.random() * spread - spread / 2;
    const velocity = startVelocity + Math.random() * 10;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${origin.x * 100}%;
      top: ${origin.y * 100}%;
      transform: translate(-50%, -50%);
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    `;

    this.container?.appendChild(particle);

    // Анимация падения
    let posX = origin.x * window.innerWidth;
    let posY = origin.y * window.innerHeight;
    let velX = Math.sin(angle * Math.PI / 180) * velocity;
    let velY = -Math.cos(angle * Math.PI / 180) * velocity;
    let rotation = Math.random() * 360;
    let rotationSpeed = Math.random() * 10 - 5;
    let opacity = 1;

    const animate = () => {
      velY += 0.5; // Гравитация
      posX += velX;
      posY += velY;
      rotation += rotationSpeed;
      opacity -= 0.02;

      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;
      particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      particle.style.opacity = `${opacity}`;

      if (opacity > 0 && posY < window.innerHeight) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  // Звездочки для успешных действий
  stars(x: number, y: number) {
    if (!this.container) return;

    const colors = ['#ffd700', '#ffed4e', '#fff'];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 3 + Math.random() * 2;
      const size = 4 + Math.random() * 4;

      particle.innerHTML = '✨';
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        font-size: ${size * 2}px;
        transform: translate(-50%, -50%);
      `;

      this.container.appendChild(particle);

      let posX = x;
      let posY = y;
      let velX = Math.cos(angle) * velocity;
      let velY = Math.sin(angle) * velocity;
      let opacity = 1;
      let scale = 1;

      const animate = () => {
        posX += velX;
        posY += velY;
        velX *= 0.98;
        velY *= 0.98;
        opacity -= 0.02;
        scale += 0.01;

        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = `${opacity}`;
        particle.style.transform = `translate(-50%, -50%) scale(${scale})`;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }

  // Пузырьки для водной темы
  bubbles(count: number = 20) {
    if (!this.container) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => this.createBubble(), i * 100);
    }
  }

  private createBubble() {
    const bubble = document.createElement('div');
    const size = Math.random() * 20 + 10;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 2;

    bubble.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), rgba(102, 126, 234, 0.2));
      border-radius: 50%;
      left: ${startX}px;
      bottom: -${size}px;
      animation: float ${duration}s ease-out forwards;
    `;

    this.container?.appendChild(bubble);

    setTimeout(() => bubble.remove(), duration * 1000);
  }

  // Огненные частицы для интенсивных тренировок
  fire(x: number, y: number) {
    if (!this.container) return;

    const colors = ['#ff6b35', '#f77737', '#ff8c42', '#ffa500'];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        box-shadow: 0 0 ${size}px ${color};
        transform: translate(-50%, -50%);
      `;

      this.container.appendChild(particle);

      let posY = y;
      let posX = x + (Math.random() - 0.5) * 20;
      let opacity = 1;
      let scale = 1;

      const animate = () => {
        posY -= 2;
        posX += (Math.random() - 0.5) * 2;
        opacity -= 0.02;
        scale -= 0.01;

        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = `${opacity}`;
        particle.style.transform = `translate(-50%, -50%) scale(${scale})`;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }

  // Эффект ряби для нажатий
  ripple(x: number, y: number, color: string = 'rgba(102, 126, 234, 0.4)') {
    if (!this.container) return;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: ${color};
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%) scale(0);
      animation: rippleEffect 0.6s ease-out;
    `;

    this.container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // Эмодзи взрыв
  emojiExplosion(emoji: string, x: number, y: number, count: number = 10) {
    if (!this.container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 5 + Math.random() * 5;

      particle.innerHTML = emoji;
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        font-size: 24px;
        transform: translate(-50%, -50%);
      `;

      this.container.appendChild(particle);

      let posX = x;
      let posY = y;
      let velX = Math.cos(angle) * velocity;
      let velY = Math.sin(angle) * velocity;
      let rotation = 0;
      let opacity = 1;

      const animate = () => {
        posX += velX;
        posY += velY;
        velY += 0.3; // Гравитация
        rotation += 10;
        opacity -= 0.02;

        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        particle.style.opacity = `${opacity}`;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    to {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes rippleEffect {
    to {
      transform: translate(-50%, -50%) scale(10);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default new ParticleService();