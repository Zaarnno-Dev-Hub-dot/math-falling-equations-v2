// Analytics types

export interface GameEvent {
  id?: string;
  event_type: 'game_start' | 'game_end' | 'correct_answer' | 'wrong_answer' | 
              'level_up' | 'equation_spawned' | 'pause' | 'resume';
  device_id?: string;
  grade?: number;
  level?: number;
  score?: number;
  data?: {
    equation?: string;
    answer?: string;
    correct_answer?: string;
    time_to_answer_ms?: number;
    final_score?: number;
    session_duration_seconds?: number;
    correct_count?: number;
    wrong_count?: number;
    accuracy?: number;
  };
  created_at?: string;
}

export interface HighScore {
  id?: string;
  player_name: string;
  score: number;
  grade: number;
  level: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  session_duration: number;
  device_id?: string;
  created_at?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  offlineMode: boolean;
  deviceId: string;
}

export interface SessionStats {
  startTime: number;
  correctCount: number;
  wrongCount: number;
  equationsSeen: string[];
}
