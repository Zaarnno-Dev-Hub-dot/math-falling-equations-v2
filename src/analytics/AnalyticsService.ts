import { supabase, isSupabaseConfigured, getDeviceId } from './supabase';
import { GameEvent, HighScore, AnalyticsConfig } from './types';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private eventQueue: GameEvent[] = [];
  private flushInterval: number | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      offlineMode: !isSupabaseConfigured(),
      deviceId: getDeviceId(),
    };
    
    // Start periodic flush if online
    if (!this.config.offlineMode) {
      this.flushInterval = window.setInterval(() => this.flushEvents(), 10000);
    }
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track a game event
  async trackEvent(event: Omit<GameEvent, 'id' | 'created_at' | 'device_id'>): Promise<void> {
    if (!this.config.enabled) return;

    const fullEvent: GameEvent = {
      ...event,
      device_id: this.config.deviceId,
      created_at: new Date().toISOString(),
    };

    if (this.config.offlineMode) {
      // Store locally for debugging
      this.storeLocalEvent(fullEvent);
    } else {
      // Queue for batch send
      this.eventQueue.push(fullEvent);
      
      // Immediate flush for important events
      if (['game_end', 'level_up'].includes(event.event_type)) {
        await this.flushEvents();
      }
    }
  }

  // Save high score
  async saveHighScore(score: HighScore): Promise<boolean> {
    // Always save locally
    this.saveLocalHighScore(score);

    if (this.config.offlineMode || !supabase) {
      return true; // Saved locally only
    }

    try {
      const { error } = await supabase.from('high_scores').insert({
        player_name: score.player_name,
        score: score.score,
        grade: score.grade,
        level: score.level,
        correct_answers: score.correct_answers,
        wrong_answers: score.wrong_answers,
        accuracy: score.accuracy,
        session_duration: score.session_duration,
        device_id: this.config.deviceId,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to save to Supabase, saved locally:', err);
      return true; // Still saved locally
    }
  }

  // Fetch global leaderboard
  async getLeaderboard(grade?: number, limit = 10): Promise<HighScore[]> {
    // Try Supabase first
    if (!this.config.offlineMode && supabase) {
      try {
        let query = supabase
          .from('high_scores')
          .select('*')
          .order('score', { ascending: false })
          .limit(limit);

        if (grade) {
          query = query.eq('grade', grade);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) return data as HighScore[];
      } catch (err) {
        console.warn('Failed to fetch from Supabase, using local:', err);
      }
    }

    // Fallback to local
    return this.getLocalHighScores(grade, limit);
  }

  // Get personal bests
  async getPersonalBests(): Promise<HighScore[]> {
    return this.getLocalHighScores(undefined, 5);
  }

  // Flush queued events to Supabase
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !supabase) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase.from('game_events').insert(
        events.map(e => ({
          event_type: e.event_type,
          device_id: e.device_id,
          grade: e.grade,
          level: e.level,
          score: e.score,
          data: e.data || {},
        }))
      );

      if (error) throw error;
    } catch (err) {
      // Re-queue failed events
      this.eventQueue.unshift(...events);
      console.warn('Failed to flush events:', err);
    }
  }

  // Local storage helpers
  private storeLocalEvent(event: GameEvent): void {
    const key = 'math-drop-local-events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.push(event);
    // Keep last 100 events
    if (events.length > 100) events.shift();
    localStorage.setItem(key, JSON.stringify(events));
  }

  private saveLocalHighScore(score: HighScore): void {
    const key = 'math-drop-high-scores';
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push(score);
    scores.sort((a: HighScore, b: HighScore) => b.score - a.score);
    // Keep top 50
    const topScores = scores.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(topScores));
  }

  private getLocalHighScores(grade?: number, limit = 10): HighScore[] {
    const key = 'math-drop-high-scores';
    let scores: HighScore[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (grade) {
      scores = scores.filter(s => s.grade === grade);
    }
    
    return scores.slice(0, limit);
  }

  // Disable/enable analytics
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled && this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(); // Final flush
  }
}
