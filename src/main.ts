import { Game } from './game/Game';
import { AudioManager } from './game/managers/AudioManager';
import './ui/styles/main.css';

// Initialize audio on first user interaction
let audioInitialized = false;

async function initAudio() {
  if (audioInitialized) return;
  
  const audio = AudioManager.getInstance();
  await audio.init();
  audioInitialized = true;
  
  // Remove initialization listeners
  document.removeEventListener('click', initAudio);
  document.removeEventListener('touchstart', initAudio);
  document.removeEventListener('keydown', initAudio);
}

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen after game initializes
  const loadingScreen = document.getElementById('loading-screen');
  
  // Initialize Phaser game
  new Game();
  
  // Hide loading screen
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 500);
    }
  }, 1000);
  
  // Setup audio initialization on first interaction
  document.addEventListener('click', initAudio);
  document.addEventListener('touchstart', initAudio);
  document.addEventListener('keydown', initAudio);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.log('SW registration failed:', err));
  });
}
