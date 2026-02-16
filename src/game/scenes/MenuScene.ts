import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private selectedGrade: number | null = null;
  private gradeButtons: Phaser.GameObjects.Container[] = [];
  private playButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MenuScene' });
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

    // Clouds
    this.createClouds();

    // Title card background
    const cardWidth = Math.min(500, width * 0.9);
    const cardHeight = 400;
    const cardX = width / 2;
    const cardY = height / 2 - 30;

    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.95);
    card.fillRoundedRect(cardX - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 24);
    card.lineStyle(3, 0x4ECDC4, 1);
    card.strokeRoundedRect(cardX - cardWidth / 2, cardY - cardHeight / 2, cardWidth, cardHeight, 24);

    // Title
    this.add.text(cardX, cardY - 120, '🎯 Math Drop', {
      fontSize: '48px',
      fontFamily: 'Nunito, Comic Neue, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cardX, cardY - 70, 'Catch the equations before they fall!', {
      fontSize: '18px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0.5);

    // Grade selection label
    this.add.text(cardX, cardY - 20, 'Pick your grade:', {
      fontSize: '20px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    // Grade buttons
    const grades = [2, 3, 4, 5];
    const buttonSpacing = 80;
    const startX = cardX - ((grades.length - 1) * buttonSpacing) / 2;

    grades.forEach((grade, index) => {
      const btnX = startX + index * buttonSpacing;
      const btnY = cardY + 40;
      
      const btn = this.createGradeButton(btnX, btnY, grade);
      this.gradeButtons.push(btn);
    });

    // Play button
    this.playButton = this.createPlayButton(cardX, cardY + 130);
    this.updatePlayButton();

    // Side monsters (emoji)
    this.createMonsters();

    // High scores button
    this.createSecondaryButton(cardX - 100, cardY + 180, '🏆 Scores', () => {
      this.scene.start('HighScoreScene');
    });

    // Settings button
    this.createSecondaryButton(cardX + 100, cardY + 180, '⚙ Settings', () => {
      // TODO: Settings scene
      console.log('Settings clicked');
    });
  }

  private createClouds(): void {
    const clouds = [
      { x: 100, y: 80, scale: 1 },
      { x: this.scale.width - 150, y: 120, scale: 0.8 },
      { x: this.scale.width / 2, y: 50, scale: 0.6 },
    ];

    clouds.forEach((cloud, i) => {
      const cloudText = this.add.text(cloud.x, cloud.y, '☁️', {
        fontSize: `${60 * cloud.scale}px`,
      }).setOrigin(0.5).setAlpha(0.8);

      // Gentle float animation
      this.tweens.add({
        targets: cloudText,
        y: cloud.y + 10,
        duration: 2000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private createGradeButton(x: number, y: number, grade: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const size = 60;
    const bg = this.add.graphics();
    bg.fillStyle(0x4ECDC4, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
    bg.lineStyle(3, 0xFFFFFF, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);

    const text = this.add.text(0, 0, grade.toString(), {
      fontSize: '28px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(size, size);

    // Hover effects
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerover', () => {
      if (this.selectedGrade !== grade) {
        this.tweens.add({
          targets: container,
          scale: 1.1,
          duration: 150,
          ease: 'Back.easeOut',
        });
      }
    });

    container.on('pointerout', () => {
      if (this.selectedGrade !== grade) {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 150,
          ease: 'Back.easeOut',
        });
      }
    });

    container.on('pointerdown', () => {
      this.selectGrade(grade);
    });

    return container;
  }

  private selectGrade(grade: number): void {
    this.selectedGrade = grade;

    // Update all buttons
    this.gradeButtons.forEach((btn, index) => {
      const isSelected = (index + 2) === grade;
      this.tweens.add({
        targets: btn,
        scale: isSelected ? 1.15 : 0.95,
        alpha: isSelected ? 1 : 0.7,
        duration: 200,
        ease: 'Back.easeOut',
      });

      // Change color of selected
      const bg = btn.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(isSelected ? 0xFF6B6B : 0x4ECDC4, 1);
      bg.fillRoundedRect(-30, -30, 60, 60, 12);
      bg.lineStyle(3, 0xFFFFFF, 1);
      bg.strokeRoundedRect(-30, -30, 60, 60, 12);
    });

    this.updatePlayButton();
  }

  private createPlayButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const width = 140;
    const height = 50;
    
    const bg = this.add.graphics();
    bg.fillStyle(0xFF6B6B, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 25);

    const text = this.add.text(0, 0, '▶ Play', {
      fontSize: '22px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(width, height);

    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      if (this.selectedGrade) {
        this.scene.start('GameScene', { grade: this.selectedGrade });
      }
    });

    return container;
  }

  private updatePlayButton(): void {
    const bg = this.playButton.getAt(0) as Phaser.GameObjects.Graphics;
    bg.clear();
    
    if (this.selectedGrade) {
      bg.fillStyle(0xFF6B6B, 1);
      this.playButton.setAlpha(1);
      this.playButton.setInteractive({ useHandCursor: true });
    } else {
      bg.fillStyle(0xCCCCCC, 1);
      this.playButton.setAlpha(0.5);
      this.playButton.disableInteractive();
    }
    
    bg.fillRoundedRect(-70, -25, 140, 50, 25);
  }

  private createSecondaryButton(x: number, y: number, label: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const text = this.add.text(0, 0, label, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#FF6B6B',
    }).setOrigin(0.5);

    container.add(text);
    container.setSize(text.width + 20, 40);

    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerover', () => {
      text.setColor('#EE5A5A');
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100,
      });
    });

    container.on('pointerout', () => {
      text.setColor('#FF6B6B');
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
      });
    });

    container.on('pointerdown', callback);

    return container;
  }

  private createMonsters(): void {
    // Left monster
    const leftMonster = this.add.text(60, this.scale.height - 120, '🐸', {
      fontSize: '64px',
    }).setOrigin(0.5);

    // Right monster
    const rightMonster = this.add.text(this.scale.width - 60, this.scale.height - 120, '🦊', {
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

      this.tweens.add({
        targets: monster,
        angle: i % 2 === 0 ? 5 : -5,
        duration: 3000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }
}
