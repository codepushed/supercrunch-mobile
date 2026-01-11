/**
 * API Configuration
 * Values are loaded from .env file
 */

// Supabase Configuration
// Using service role key to bypass RLS (same as web project)
export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://juztduienveyltogocdb.supabase.co',
  ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1enRkdWllbnZleWx0b2dvY2RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM1MDcxOSwiZXhwIjoyMDY1OTI2NzE5fQ.jhmNd7HAZP-dyJpaAYEfl3QkYSGy_Ub13Ta0SsFyvis',
};

console.log('🔧 Config loaded - URL:', SUPABASE_CONFIG.URL);
console.log('🔧 Config loaded - Key length:', SUPABASE_CONFIG.ANON_KEY.length);
