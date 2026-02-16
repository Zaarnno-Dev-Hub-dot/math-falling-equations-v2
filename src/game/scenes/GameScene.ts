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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.grade = data.grade;
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
    // Create HTML input element
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'number';
    this.inputElement.className = 'numpad-input';
    this.inputElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 60px;
      font-size: 32px;
      text-align: center;
      border: 4px solid #2C3E50;
      border-radius: 16px;
      background: white;
      font-family: Nunito, sans-serif;
      font-weight: bold;
      outline: none;
      z-index: 100;
    `;

    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitAnswer();
      }
    });

    document.body.appendChild(this.inputElement);
    this.inputElement.focus();
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

    let found = false;

    for (let i = this.equations.length - 1; i >= 0; i--) {
      const container = this.equations[i];
      const equation: Equation = container.getData('equation');

      const result = AnswerValidator.validate(input, equation.answer);
      
      if (result.correct) {
        this.handleCorrect(container, equation);
        this.equations.splice(i, 1);
        container.destroy();
        found = true;
        break;
      }
    }

    if (!found) {
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
    } else {
      this.scene.pause();
      this.inputElement.disabled = true;
      AudioManager.getInstance().pauseBGM();
    }
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
