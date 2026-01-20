/**
 * Restaurant Service
 * Handles restaurant status (open/closed) API calls to Supabase
 */

import { supabase } from '@/lib/supabase';

export interface RestaurantStatus {
  id: number;
  is_open: boolean;
}

/**
 * Fetch current restaurant status
 */
export const fetchRestaurantStatus = async (): Promise<{
  data: boolean;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_status')
      .select('is_open')
      .eq('id', 1)
      .single();

    if (error) {
      // If table doesn't exist or no data, default to open
      if (error.code === '42P01' || error.code === 'PGRST116') {
        console.log('Restaurant status table not found, defaulting to open');
        return { data: true, error: null };
      }
      console.error('Error fetching restaurant status:', error);
      return { data: true, error };
    }

    return { data: data?.is_open ?? true, error: null };
  } catch (error) {
    console.error('Exception fetching restaurant status:', error);
    return { data: true, error };
  }
};

/**
 * Update restaurant status (open/closed)
 * @param isOpen - New status (true = open, false = closed)
 */
export const updateRestaurantStatus = async (
  isOpen: boolean
): Promise<{ data: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('restaurant_status')
      .upsert({ id: 1, is_open: isOpen }, { onConflict: 'id' });

    if (error) {
      console.error('Error updating restaurant status:', error);
      return { data: !isOpen, error };
    }

    console.log(`Restaurant status updated to: ${isOpen ? 'Open' : 'Closed'}`);
    return { data: isOpen, error: null };
  } catch (error) {
    console.error('Exception updating restaurant status:', error);
    return { data: !isOpen, error };
  }
};
