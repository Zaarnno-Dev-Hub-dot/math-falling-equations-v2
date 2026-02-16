import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { AnalyticsService } from '@analytics/AnalyticsService';

export class SettingsScene extends Phaser.Scene {
  private audioManager: AudioManager;
  private analytics: AnalyticsService;

  constructor() {
    super({ key: 'SettingsScene' });
    this.audioManager = AudioManager.getInstance();
    this.analytics = AnalyticsService.getInstance();
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.image(width / 2, height / 2, 'sky-gradient')
      .setDisplaySize(width, height);

    // Card
    const cardWidth = Math.min(450, width * 0.9);
    const cardHeight = 500;
    
    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.95);
    card.fillRoundedRect(width / 2 - cardWidth / 2, height / 2 - cardHeight / 2, cardWidth, cardHeight, 24);

    // Title
    this.add.text(width / 2, height / 2 - cardHeight / 2 + 50, '⚙ Settings', {
      fontSize: '36px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0.5);

    // Settings
    this.createToggleSetting(width / 2, height / 2 - 120, 'Sound Effects', this.audioManager.getSettings().sfxEnabled, (enabled) => {
      this.audioManager.setSFXEnabled(enabled);
    });

    this.createToggleSetting(width / 2, height / 2 - 50, 'Music', this.audioManager.getSettings().musicEnabled, (enabled) => {
      this.audioManager.setMusicEnabled(enabled);
    });

    this.createSliderSetting(width / 2, height / 2 + 20, 'SFX Volume', this.audioManager.getSettings().sfxVolume, (value) => {
      this.audioManager.setSFXVolume(value);
    });

    this.createSliderSetting(width / 2, height / 2 + 90, 'Music Volume', this.audioManager.getSettings().musicVolume, (value) => {
      this.audioManager.setMusicVolume(value);
    });

    this.createToggleSetting(width / 2, height / 2 + 160, 'Analytics (Anonymous)', true, (enabled) => {
      this.analytics.setEnabled(enabled);
    });

    // Back button
    this.createBackButton(width / 2, height / 2 + 220);
  }

  private createToggleSetting(x: number, y: number, label: string, initialValue: boolean, onChange: (value: boolean) => void): void {
    // Label
    this.add.text(x - 120, y, label, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0, 0.5);

    // Toggle button
    const toggle = this.add.container(x + 120, y);
    const bg = this.add.graphics();
    
    let isOn = initialValue;
    
    const drawToggle = () => {
      bg.clear();
      // Background
      bg.fillStyle(isOn ? 0x4ECDC4 : 0xCCCCCC, 1);
      bg.fillRoundedRect(-35, -15, 70, 30, 15);
      // Circle
      bg.fillStyle(0xFFFFFF, 1);
      bg.fillCircle(isOn ? 20 : -20, 0, 12);
    };
    
    drawToggle();
    toggle.add(bg);
    toggle.setSize(70, 30);

    toggle.setInteractive({ useHandCursor: true });
    toggle.on('pointerdown', () => {
      isOn = !isOn;
      drawToggle();
      onChange(isOn);
      
      // Click sound
      if (isOn) this.audioManager.playCorrect();
    });
  }

  private createSliderSetting(x: number, y: number, label: string, initialValue: number, onChange: (value: number) => void): void {
    // Label
    this.add.text(x - 120, y, label, {
      fontSize: '16px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#2C3E50',
    }).setOrigin(0, 0.5);

    // Track
    const track = this.add.graphics();
    track.fillStyle(0xE0E0E0, 1);
    track.fillRoundedRect(x + 30, y - 4, 140, 8, 4);

    // Fill
    const fill = this.add.graphics();
    
    let value = initialValue;
    
    const updateFill = () => {
      fill.clear();
      fill.fillStyle(0xFF6B6B, 1);
      fill.fillRoundedRect(x + 30, y - 4, 140 * value, 8, 4);
    };
    
    updateFill();

    // Handle
    const handle = this.add.circle(x + 30 + 140 * value, y, 12, 0xFF6B6B);
    handle.setStrokeStyle(3, 0xFFFFFF);

    // Value text
    const valueText = this.add.text(x + 190, y, `${Math.round(value * 100)}%`, {
      fontSize: '14px',
      fontFamily: 'Nunito, sans-serif',
      color: '#5D6D7E',
    }).setOrigin(0, 0.5);

    // Make interactive
    const zone = this.add.zone(x + 30, y, 140, 40).setInteractive({ useHandCursor: true });
    
    let isDragging = false;
    
    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      updateSlider(pointer.x);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        updateSlider(pointer.x);
      }
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });

    const updateSlider = (pointerX: number) => {
      const relativeX = Math.max(0, Math.min(140, pointerX - (x + 30)));
      value = relativeX / 140;
      handle.x = x + 30 + relativeX;
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill();
      onChange(value);
    };
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
