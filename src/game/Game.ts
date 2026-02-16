import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { HighScoreScene } from './scenes/HighScoreScene';
import { SettingsScene } from './scenes/SettingsScene';

export class Game {
  private game: Phaser.Game;
  
  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#87CEEB',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, MenuScene, GameScene, GameOverScene, HighScoreScene, SettingsScene],
      render: {
        pixelArt: false,
        antialias: true,
      },
    };
    
    this.game = new Phaser.Game(config);
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.game.scale.resize(window.innerWidth, window.innerHeight);
    });
  }
}
