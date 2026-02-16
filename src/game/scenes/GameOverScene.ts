import Phaser from 'phaser';
import { AnalyticsService } from '@analytics/AnalyticsService';
import { HighScore } from '@analytics/types';

interface GameOverData {
  score: number;
  level: number;
  grade: number;
  accuracy: number;
}

export class GameOverScene extends Phaser.Scene {
  private data_!: GameOverData;
  private nameInput!: HTMLInputElement;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.data_ = data;
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.image(width / 2, height / 2, 'sky-gradient')
      .setDisplaySize(width, height);

    // Card
    const cardWidth = Math.min(400, width * 0.9);
    const cardHeight = 450;
    
    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.95);
    card.fillRoundedRect(width / 2 - cardWidth / 2, height / 2 - cardHeight / 2, cardWidth, cardHeight, 24);

    // Title
    this.add.text(width / 2, height / 2 - 180, '💥 Game Over!', {
      fontSize: '36px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height / 2 - 120, 'Final Score', {
      fontSize: '14px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 90, this.data_.score.toString(), {
      fontSize: '48px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FF6B6B',
    }).setOrigin(0.5);

    // Stats
    this.add.text(width / 2, height / 2 - 30, `Level ${this.data_.level} • Grade ${this.data_.grade}`, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 5, `Accuracy: ${this.data_.accuracy.toFixed(1)}%`, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5);

    // Name input
    this.createNameInput(width / 2, height / 2 + 50);

    // Buttons
    this.createButton(width / 2, height / 2 + 120, 'Save Score', 0xFF6B6B, () => this.saveScore());
    this.createButton(width / 2, height / 2 + 180, 'Play Again', 0x4ECDC4, () => this.restart());
    this.createSecondaryButton(width / 2, height / 2 + 220, 'Main Menu', () => {
      this.cleanup();
      this.scene.start('MenuScene');
    });
  }

  private createNameInput(_x: number, y: number): void {
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Enter your name';
    this.nameInput.maxLength = 20;
    this.nameInput.style.cssText = `
      position: fixed;
      left: 50%;
      top: ${y}px;
      transform: translateX(-50%);
      width: 250px;
      height: 45px;
      font-size: 18px;
      text-align: center;
      border: 3px solid #E0E0E0;
      border-radius: 12px;
      background: white;
      font-family: Nunito, sans-serif;
      outline: none;
      z-index: 100;
    `;

    this.nameInput.addEventListener('focus', () => {
      this.nameInput.style.borderColor = '#FF6B6B';
    });

    this.nameInput.addEventListener('blur', () => {
      this.nameInput.style.borderColor = '#E0E0E0';
    });

    document.body.appendChild(this.nameInput);
    this.nameInput.focus();
  }

  private createButton(x: number, y: number, text: string, color: number, callback: () => void): void {
    const container = this.add.container(x, y);
    
    const width = 180;
    const height = 50;
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 25);

    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(width, height);

    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', callback);

    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100,
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
      });
    });
  }

  private createSecondaryButton(x: number, y: number, text: string, callback: () => void): void {
    const btn = this.add.text(x, y, text, {
      fontSize: '14px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#2C3E50'));
    btn.on('pointerout', () => btn.setColor('#5D6D7E'));
    btn.on('pointerdown', callback);
  }

  private async saveScore(): Promise<void> {
    const name = this.nameInput.value.trim() || 'Player';
    
    const score: HighScore = {
      player_name: name,
      score: this.data_.score,
      grade: this.data_.grade,
      level: this.data_.level,
      correct_answers: 0,
      wrong_answers: 0,
      accuracy: this.data_.accuracy,
      session_duration: 0,
    };

    await AnalyticsService.getInstance().saveHighScore(score);
    
    this.cleanup();
    this.scene.start('HighScoreScene');
  }

  private restart(): void {
    this.cleanup();
    this.scene.start('GameScene', { grade: this.data_.grade });
  }

  private cleanup(): void {
    this.nameInput?.remove();
  }
}
