import Phaser from 'phaser';
import { AnalyticsService } from '@analytics/AnalyticsService';
import { HighScore } from '@analytics/types';

export class HighScoreScene extends Phaser.Scene {
  private scores: HighScore[] = [];
  private currentFilter: number | 'all' = 'all';
  private scoreContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'HighScoreScene' });
  }

  async create(): Promise<void> {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.image(width / 2, height / 2, 'sky-gradient')
      .setDisplaySize(width, height);

    // Card
    const cardWidth = Math.min(500, width * 0.95);
    const cardHeight = Math.min(600, height * 0.9);
    
    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.95);
    card.fillRoundedRect(width / 2 - cardWidth / 2, height / 2 - cardHeight / 2, cardWidth, cardHeight, 24);

    // Title
    this.add.text(width / 2, height / 2 - cardHeight / 2 + 40, '🏆 High Scores', {
      fontSize: '32px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    // Filter tabs
    this.createTabs(width / 2, height / 2 - cardHeight / 2 + 90);

    // Score list container
    this.scoreContainer = this.add.container(width / 2, height / 2 - cardHeight / 2 + 130);

    // Back button
    this.createBackButton(width / 2, height / 2 + cardHeight / 2 - 40);

    // Load scores
    await this.loadScores();
    this.renderScores();
  }

  private createTabs(x: number, y: number): void {
    const tabs = [
      { label: 'All', value: 'all' as const },
      { label: 'G2', value: 2 },
      { label: 'G3', value: 3 },
      { label: 'G4', value: 4 },
      { label: 'G5', value: 5 },
    ];

    const spacing = 60;
    const startX = x - ((tabs.length - 1) * spacing) / 2;

    tabs.forEach((tab, index) => {
      const tabX = startX + index * spacing;
      
      const btn = this.add.text(tabX, y, tab.label, {
        fontSize: '14px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'bold',
        color: this.currentFilter === tab.value ? '#FFFFFF' : '#4ECDC4',
        backgroundColor: this.currentFilter === tab.value ? '#4ECDC4' : '#FFFFFF',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      // Border
      const bounds = btn.getBounds();
      const border = this.add.graphics();
      border.lineStyle(2, 0x4ECDC4, 1);
      border.strokeRoundedRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8, 12);

      btn.on('pointerdown', () => {
        this.currentFilter = tab.value;
        this.scene.restart();
      });
    });
  }

  private async loadScores(): Promise<void> {
    this.scores = await AnalyticsService.getInstance().getLeaderboard(
      this.currentFilter === 'all' ? undefined : this.currentFilter,
      10
    );
  }

  private renderScores(): void {
    this.scoreContainer.removeAll(true);

    if (this.scores.length === 0) {
      const empty = this.add.text(0, 100, 'No scores yet!', {
        fontSize: '16px',
        fontFamily: 'Nunito, sans-serif',
        color: '#95A5A6',
      }).setOrigin(0.5);
      this.scoreContainer.add(empty);
      return;
    }

    this.scores.forEach((score, index) => {
      const y = index * 40;
      const row = this.createScoreRow(0, y, index + 1, score);
      this.scoreContainer.add(row);
    });
  }

  private createScoreRow(x: number, y: number, rank: number, score: HighScore): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const rowWidth = 400;

    // Rank
    const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#4ECDC4';
    const rankText = this.add.text(-rowWidth / 2 + 20, 0, `#${rank}`, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: rankColor,
    }).setOrigin(0, 0.5);

    // Name
    const nameText = this.add.text(-rowWidth / 2 + 60, 0, score.player_name, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      color: '#2C3E50',
    }).setOrigin(0, 0.5);

    // Score
    const scoreText = this.add.text(rowWidth / 2 - 60, 0, score.score.toString(), {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FF6B6B',
    }).setOrigin(1, 0.5);

    // Grade
    const gradeText = this.add.text(rowWidth / 2 - 10, 0, `G${score.grade}`, {
      fontSize: '12px',
      fontFamily: 'Nunito, sans-serif',
      color: '#95A5A6',
    }).setOrigin(1, 0.5);

    // Divider line (except for last)
    if (rank < 10) {
      const line = this.add.graphics();
      line.lineStyle(1, 0xE0E0E0, 1);
      line.lineBetween(-rowWidth / 2, 20, rowWidth / 2, 20);
      container.add(line);
    }

    container.add([rankText, nameText, scoreText, gradeText]);
    return container;
  }

  private createBackButton(x: number, y: number): void {
    const btn = this.add.text(x, y, '← Back to Menu', {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FF6B6B',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#EE5A5A'));
    btn.on('pointerout', () => btn.setColor('#FF6B6B'));
    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
