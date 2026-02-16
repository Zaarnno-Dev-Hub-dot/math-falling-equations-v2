// Supabase client configuration
// Falls back to local-only mode if not configured

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Create client only if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Device fingerprint for anonymous tracking
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('math-drop-device-id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('math-drop-device-id', deviceId);
  }
  return deviceId;
};
