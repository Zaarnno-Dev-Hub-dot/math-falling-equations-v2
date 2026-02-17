import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { EquationGenerator, Equation } from '@math/equation-generator';
import { AnswerValidator } from '@math/validator';
import { AnalyticsService } from '@analytics/AnalyticsService';

interface GameSceneData {
  grade: number;
}

export class GameScene extends Phaser.Scene {
  private grade!: number;
  private level = 1;
  private score = 0;
  private lives = 3;
  private correctCount = 0;
  private wrongCount = 0;
  private equations: Phaser.GameObjects.Container[] = [];
  private equationGenerator!: EquationGenerator;
  private spawnTimer!: Phaser.Time.TimerEvent;
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private inputElement!: HTMLInputElement;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private monsters!: { sprite: Phaser.GameObjects.Text; bubble: Phaser.GameObjects.Container }[];
  private numpadElement: HTMLDivElement | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    // Reset all game state
    this.grade = data.grade;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.equations = [];
    this.equationGenerator = new EquationGenerator(this.grade);
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.image(width / 2, height / 2, 'sky-gradient')
      .setDisplaySize(width, height);

    // Ground
    this.add.image(width / 2, height - 50, 'ground-gradient')
      .setDisplaySize(width, 100);

    // UI Panel
    this.createUI();

    // Create HTML input overlay
    this.createInputOverlay();

    // Create monsters
    this.createMonsters();

    // Start spawning equations
    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      callback: this.spawnEquation,
      callbackScope: this,
      loop: true,
    });

    // Start BGM
    AudioManager.getInstance().startBGM();

    // Track game start
    AnalyticsService.getInstance().trackEvent({
      event_type: 'game_start',
      grade: this.grade,
      level: this.level,
      score: this.score,
    });
  }

  private createUI(): void {
    const width = this.scale.width;
    const padding = 20;

    // Top panel background
    const panel = this.add.graphics();
    panel.fillStyle(0xFFFFFF, 0.95);
    panel.fillRoundedRect(padding, padding, width - padding * 2, 60, 16);
    panel.lineStyle(2, 0x4ECDC4, 1);
    panel.strokeRoundedRect(padding, padding, width - padding * 2, 60, 16);

    // Score
    this.add.text(padding + 20, padding + 15, 'Score', {
      fontSize: '12px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    });
    this.scoreText = this.add.text(padding + 20, padding + 35, '0', {
      fontSize: '24px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    });

    // Level
    this.add.text(width / 2 - 20, padding + 15, 'Level', {
      fontSize: '12px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5, 0);
    this.levelText = this.add.text(width / 2 - 20, padding + 35, '1', {
      fontSize: '24px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#4ECDC4',
    }).setOrigin(0.5, 0);

    // Lives
    this.add.text(width - padding - 20, padding + 15, 'Lives', {
      fontSize: '12px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(1, 0);
    this.livesText = this.add.text(width - padding - 20, padding + 32, '❤️❤️❤️', {
      fontSize: '20px',
    }).setOrigin(1, 0);

    // Pause button
    const pauseBtn = this.add.text(width - padding - 20, padding + 80, '⏸', {
      fontSize: '24px',
    }).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  private createInputOverlay(): void {
    // Create HTML input element (readonly to prevent native keyboard)
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.readOnly = true;
    this.inputElement.className = 'numpad-input';
    this.inputElement.style.cssText = `
      position: fixed;
      bottom: 155px;
      left: 50%;
      transform: translateX(-50%);
      width: 180px;
      height: 50px;
      font-size: 28px;
      text-align: center;
      border: 3px solid #2C3E50;
      border-radius: 12px;
      background: white;
      font-family: Nunito, sans-serif;
      font-weight: bold;
      outline: none;
      z-index: 101;
      caret-color: transparent;
    `;

    document.body.appendChild(this.inputElement);

    // Create on-screen numpad
    this.createOnScreenNumpad();
  }

  private createOnScreenNumpad(): void {
    const numpad = document.createElement('div');
    numpad.id = 'on-screen-numpad';
    numpad.style.cssText = `
      position: fixed;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: repeat(5, 50px);
      gap: 4px;
      padding: 6px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      z-index: 100;
    `;

    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0', '⌫', ' ', 'Enter'];
    
    buttons.forEach((btn) => {
      const button = document.createElement('button');
      button.textContent = btn;
      button.style.cssText = `
        width: 50px;
        height: 36px;
        font-size: 16px;
        font-family: Nunito, sans-serif;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        background: ${btn === 'Enter' ? '#FF6B6B' : btn === '⌫' ? '#E74C3C' : '#4ECDC4'};
        color: white;
        cursor: pointer;
        touch-action: manipulation;
      `;
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (btn === 'Enter') {
          this.submitAnswer();
        } else if (btn === '⌫') {
          this.inputElement.value = this.inputElement.value.slice(0, -1);
        } else if (btn === ' ') {
          this.inputElement.value += ' ';
        } else {
          this.inputElement.value += btn;
        }
      });

      // Touch feedback
      button.addEventListener('touchstart', () => {
        button.style.transform = 'scale(0.95)';
      });
      button.addEventListener('touchend', () => {
        button.style.transform = 'scale(1)';
      });

      numpad.appendChild(button);
    });

    document.body.appendChild(numpad);

    // Store reference for cleanup
    this.numpadElement = numpad;
  }

  private createMonsters(): void {
    const height = this.scale.height;

    // Left monster (Frog)
    const leftMonster = this.add.text(60, height - 150, '🐸', {
      fontSize: '64px',
    }).setOrigin(0.5);

    // Right monster (Fox)
    const rightMonster = this.add.text(this.scale.width - 60, height - 150, '🦊', {
      fontSize: '64px',
    }).setOrigin(0.5);

    // Float animations
    [leftMonster, rightMonster].forEach((monster, i) => {
      this.tweens.add({
        targets: monster,
        y: monster.y - 15,
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Store monsters for reaction access
    this.monsters = [
      { sprite: leftMonster, bubble: this.createSpeechBubble(leftMonster.x, leftMonster.y - 80) },
      { sprite: rightMonster, bubble: this.createSpeechBubble(rightMonster.x, rightMonster.y - 80) },
    ];
  }

  private createSpeechBubble(x: number, y: number): Phaser.GameObjects.Container {
    const bubble = this.add.container(x, y);
    bubble.setVisible(false);
    bubble.setDepth(50);

    // Bubble background
    const bg = this.add.graphics();
    bubble.add(bg);

    // Text
    const text = this.add.text(0, -5, '', {
      fontSize: '14px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);
    bubble.add(text);

    // Store references
    bubble.setData('bg', bg);
    bubble.setData('text', text);

    return bubble;
  }

  private showMonsterReaction(type: 'correct' | 'wrong' | 'levelUp'): void {
    const messages = {
      correct: ['🎉 Great!', '✨ Awesome!', '🌟 Nice!', '💪 Keep it up!', '🎯 Perfect!'],
      wrong: ['😢 Oops!', '💫 Try again!', '🌈 Almost!', '💪 Don\'t give up!'],
      levelUp: ['🚀 Level Up!', '🎊 Amazing!', '🔥 On fire!', '🌟 Wow!'],
    };

    const colors = {
      correct: 0x4ECDC4,
      wrong: 0xE74C3C,
      levelUp: 0xFFE66D,
    };

    // Pick random monster
    const monster = this.monsters[Math.floor(Math.random() * this.monsters.length)];
    const bubble = monster.bubble;

    // Get random message
    const message = messages[type][Math.floor(Math.random() * messages[type].length)];

    // Update bubble
    const bg = bubble.getData('bg') as Phaser.GameObjects.Graphics;
    const text = bubble.getData('text') as Phaser.GameObjects.Text;

    text.setText(message);

    // Resize bubble
    const width = text.width + 24;
    const height = text.height + 20;

    bg.clear();
    bg.fillStyle(colors[type], 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(2, 0xFFFFFF, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

    // Triangle pointer
    bg.fillStyle(colors[type], 1);
    bg.beginPath();
    bg.moveTo(-8, height / 2);
    bg.lineTo(8, height / 2);
    bg.lineTo(0, height / 2 + 10);
    bg.closePath();
    bg.fillPath();

    // Show bubble with animation
    bubble.setVisible(true);
    bubble.setScale(0);
    bubble.setAlpha(0);

    this.tweens.add({
      targets: bubble,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Animate monster
    this.tweens.add({
      targets: monster.sprite,
      scale: 1.2,
      angle: type === 'wrong' ? 10 : (type === 'levelUp' ? 360 : 0),
      duration: 300,
      yoyo: true,
      ease: 'Power2',
    });

    // Hide after delay
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: bubble,
        scale: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => bubble.setVisible(false),
      });
    });
  }

  private spawnEquation(): void {
    const width = this.scale.width;
    const equation = this.equationGenerator.generate();
    
    const container = this.createEquationContainer(equation);
    container.x = Phaser.Math.Between(60, width - 60);
    container.y = -40;
    
    this.equations.push(container);
  }

  private createEquationContainer(equation: Equation): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    
    const text = this.add.text(0, 0, equation.text, {
      fontSize: '28px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    const width = text.width + 30;
    const height = 50;

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(3, 0x4ECDC4, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

    container.add([bg, text]);
    container.setData('equation', equation);

    return container;
  }

  private submitAnswer(): void {
    const input = this.inputElement.value.trim();
    if (!input) return;

    // Find all matching equations
    const matches: { container: Phaser.GameObjects.Container; equation: Equation; index: number }[] = [];

    for (let i = 0; i < this.equations.length; i++) {
      const container = this.equations[i];
      const equation: Equation = container.getData('equation');

      const result = AnswerValidator.validate(input, equation.answer);
      
      if (result.correct) {
        matches.push({ container, equation, index: i });
      }
    }

    if (matches.length > 0) {
      // Sort by Y position (highest Y = closest to ground)
      matches.sort((a, b) => b.container.y - a.container.y);
      
      // Get the one closest to the ground
      const target = matches[0];
      
      this.handleCorrect(target.container, target.equation);
      this.equations.splice(target.index, 1);
      target.container.destroy();
    } else {
      this.handleWrong();
    }

    this.inputElement.value = '';
    this.inputElement.focus();
  }

  private handleCorrect(container: Phaser.GameObjects.Container, equation: Equation): void {
    this.score += 10 * this.level;
    this.correctCount++;
    
    // Particles
    this.createParticles(container.x, container.y, 0x4ECDC4);
    
    // Monster reaction
    this.showMonsterReaction('correct');
    
    // Sound
    AudioManager.getInstance().playCorrect();

    // Check level up
    if (this.correctCount % 10 === 0) {
      this.levelUp();
    }

    // Track
    AnalyticsService.getInstance().trackEvent({
      event_type: 'correct_answer',
      grade: this.grade,
      level: this.level,
      score: this.score,
      data: {
        equation: equation.text,
        time_to_answer_ms: 0,
      },
    });

    this.updateUI();
  }

  private handleWrong(): void {
    this.score = Math.max(0, this.score - 5);
    this.wrongCount++;
    
    // Shake input
    this.inputElement.style.animation = 'shake 0.4s';
    setTimeout(() => {
      this.inputElement.style.animation = '';
    }, 400);

    // Monster reaction
    this.showMonsterReaction('wrong');

    // Sound
    AudioManager.getInstance().playWrong();

    // Track
    AnalyticsService.getInstance().trackEvent({
      event_type: 'wrong_answer',
      grade: this.grade,
      level: this.level,
      score: this.score,
    });

    this.updateUI();
  }

  private levelUp(): void {
    this.level++;
    this.equationGenerator.setLevel(this.level);
    
    // Faster spawning
    this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: Math.max(1500, 3000 - (this.level - 1) * 200),
      callback: this.spawnEquation,
      callbackScope: this,
      loop: true,
    });

    // Sound
    AudioManager.getInstance().playLevelUp();

    // Monster reaction
    this.showMonsterReaction('levelUp');

    // Track
    AnalyticsService.getInstance().trackEvent({
      event_type: 'level_up',
      grade: this.grade,
      level: this.level,
      score: this.score,
    });

    // Visual feedback
    this.cameras.main.flash(500);
  }

  private createParticles(x: number, y: number, color: number): void {
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, Phaser.Math.Between(3, 6));
      particle.x = x;
      particle.y = y;

      const angle = Phaser.Math.Between(0, 360);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 100,
        y: y + Math.sin(angle) * 100,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private updateUI(): void {
    this.scoreText.setText(this.score.toString());
    this.levelText.setText(this.level.toString());
    this.livesText.setText('❤️'.repeat(this.lives));
  }

  private togglePause(): void {
    if (this.scene.isPaused()) {
      this.scene.resume();
      this.inputElement.disabled = false;
      this.inputElement.focus();
      AudioManager.getInstance().resumeBGM();
      this.pauseOverlay.setVisible(false);
    } else {
      this.scene.pause();
      this.inputElement.disabled = true;
      AudioManager.getInstance().pauseBGM();
      this.showPauseOverlay();
    }
  }

  private showPauseOverlay(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Create pause overlay if not exists
    if (!this.pauseOverlay) {
      this.pauseOverlay = this.add.container(width / 2, height / 2);

      // Semi-transparent background
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.7);
      bg.fillRect(-width / 2, -height / 2, width, height);
      this.pauseOverlay.add(bg);

      // Pause card
      const card = this.add.graphics();
      card.fillStyle(0xFFFFFF, 1);
      card.fillRoundedRect(-150, -120, 300, 240, 24);
      this.pauseOverlay.add(card);

      // Title
      const title = this.add.text(0, -80, '⏸ Paused', {
        fontSize: '32px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'bold',
        color: '#2C3E50',
      }).setOrigin(0.5);
      this.pauseOverlay.add(title);

      // Resume button
      const resumeBtn = this.createPauseButton(0, -20, 'Resume', 0x4ECDC4, () => {
        this.togglePause();
      });
      this.pauseOverlay.add(resumeBtn);

      // Quit button
      const quitBtn = this.createPauseButton(0, 40, 'Quit to Menu', 0xE74C3C, () => {
        this.cleanupAndQuit();
      });
      this.pauseOverlay.add(quitBtn);

      this.pauseOverlay.setDepth(100);
    }

    this.pauseOverlay.setVisible(true);
  }

  private createPauseButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-100, -25, 200, 50, 25);

    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(200, 50);

    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', callback);

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scale: 1.05, duration: 100 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 100 });
    });

    return btn;
  }

  private cleanupAndQuit(): void {
    this.spawnTimer.remove();
    this.inputElement?.remove();
    this.numpadElement?.remove();
    AudioManager.getInstance().stopBGM();
    this.scene.start('MenuScene');
  }

  update(_time: number, delta: number): void {
    const groundY = this.scale.height * 0.85;

    for (let i = this.equations.length - 1; i >= 0; i--) {
      const eq = this.equations[i];
      eq.y += (1 + (this.level - 1) * 0.2) * (delta / 16);

      if (eq.y > groundY) {
        this.lives--;
        this.updateUI();
        
        eq.destroy();
        this.equations.splice(i, 1);

        AudioManager.getInstance().playWrong();

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    }
  }

  private gameOver(): void {
    this.spawnTimer.remove();
    this.inputElement.remove();
    this.numpadElement?.remove();
    AudioManager.getInstance().stopBGM();

    // Calculate stats
    const total = this.correctCount + this.wrongCount;
    const accuracy = total > 0 ? (this.correctCount / total) * 100 : 0;

    // Track
    AnalyticsService.getInstance().trackEvent({
      event_type: 'game_end',
      grade: this.grade,
      level: this.level,
      score: this.score,
      data: {
        final_score: this.score,
        correct_count: this.correctCount,
        wrong_count: this.wrongCount,
        accuracy: Math.round(accuracy),
      },
    });

    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.level,
      grade: this.grade,
      accuracy,
    });
  }
}
