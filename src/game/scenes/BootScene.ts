import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // No external assets needed - we draw everything procedurally
    // Could preload fonts here if needed
  }

  create(): void {
    // Create gradient background texture
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 512);
    
    this.textures.addCanvas('sky-gradient', canvas);
    
    // Create ground texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1;
    groundCanvas.height = 100;
    const gCtx = groundCanvas.getContext('2d')!;
    
    const groundGrad = gCtx.createLinearGradient(0, 0, 0, 100);
    groundGrad.addColorStop(0, '#4CAF50');
    groundGrad.addColorStop(1, '#388E3C');
    gCtx.fillStyle = groundGrad;
    gCtx.fillRect(0, 0, 1, 100);
    
    this.textures.addCanvas('ground-gradient', groundCanvas);
    
    // Go to menu
    this.scene.start('MenuScene');
  }
}
