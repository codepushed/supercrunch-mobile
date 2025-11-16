/**
 * API Configuration
 * Values are loaded from .env file
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://juztduienveyltogocdb.supabase.co',
  ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1enRkdWllbnZleWx0b2dvY2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTA3MTksImV4cCI6MjA2NTkyNjcxOX0.ShkqwH71NMt58F6D3ayGvb-NaJ0WXP5-1XG4rSmdkbc',
};

console.log('🔧 Config loaded - URL:', SUPABASE_CONFIG.URL);
console.log('🔧 Config loaded - Key length:', SUPABASE_CONFIG.ANON_KEY.length);
