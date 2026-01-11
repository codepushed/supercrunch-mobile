/**
 * Dishes Service
 * Handles all menu/dish-related API calls to Supabase
 */

import { Dish, supabase } from '@/lib/supabase';

/**
 * Fetch all dishes from the database
 * @param onlyVisible - If true, only fetch visible dishes
 */
export const fetchDishes = async (
  onlyVisible: boolean = false
): Promise<{ data: Dish[] | null; error: any }> => {
  try {
    console.log('🔍 Fetching dishes from Supabase...');

    let query = supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (onlyVisible) {
      query = query.eq('is_visible', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching dishes:', error);
      return { data: null, error };
    }

    // Convert tags from comma-separated string to array if needed
    const processedData = data?.map(dish => ({
      ...dish,
      tags: typeof dish.tags === 'string'
        ? dish.tags.split(',').filter(Boolean)
        : dish.tags || [],
    })) as Dish[];

    console.log('✅ Dishes fetched successfully:', processedData?.length || 0, 'items');

    return { data: processedData, error: null };
  } catch (error) {
    console.error('💥 Exception fetching dishes:', error);
    return { data: null, error };
  }
};

/**
 * Fetch a single dish by ID
 * @param dishId - The dish ID
 */
export const fetchDishById = async (
  dishId: string
): Promise<{ data: Dish | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('id', dishId)
      .single();

    if (error) {
      console.error('Error fetching dish:', error);
      return { data: null, error };
    }

    // Convert tags from comma-separated string to array if needed
    const processedData = {
      ...data,
      tags: typeof data.tags === 'string'
        ? data.tags.split(',').filter(Boolean)
        : data.tags || [],
    } as Dish;

    return { data: processedData, error: null };
  } catch (error) {
    console.error('Exception fetching dish:', error);
    return { data: null, error };
  }
};

/**
 * Create a new dish
 * @param dish - The dish data (without id, created_at, updated_at)
 */
export const createDish = async (
  dish: Omit<Dish, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Dish | null; error: any }> => {
  try {
    console.log('📝 Creating new dish:', dish.name);

    // Convert tags array to comma-separated string for storage
    const dishData = {
      ...dish,
      tags: Array.isArray(dish.tags) ? dish.tags.join(',') : dish.tags,
    };

    const { data, error } = await supabase
      .from('dishes')
      .insert(dishData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating dish:', error);
      return { data: null, error };
    }

    console.log('✅ Dish created successfully:', data);

    // Convert tags back to array
    const processedData = {
      ...data,
      tags: typeof data.tags === 'string'
        ? data.tags.split(',').filter(Boolean)
        : data.tags || [],
    } as Dish;

    return { data: processedData, error: null };
  } catch (error) {
    console.error('💥 Exception creating dish:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing dish
 * @param dishId - The dish ID
 * @param updates - The fields to update
 */
export const updateDish = async (
  dishId: string,
  updates: Partial<Omit<Dish, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Dish | null; error: any }> => {
  try {
    console.log('📝 Updating dish:', dishId);

    // Convert tags array to comma-separated string for storage if present
    const updateData = {
      ...updates,
      tags: updates.tags
        ? (Array.isArray(updates.tags) ? updates.tags.join(',') : updates.tags)
        : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('dishes')
      .update(updateData)
      .eq('id', dishId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating dish:', error);
      return { data: null, error };
    }

    console.log('✅ Dish updated successfully:', data);

    // Convert tags back to array
    const processedData = {
      ...data,
      tags: typeof data.tags === 'string'
        ? data.tags.split(',').filter(Boolean)
        : data.tags || [],
    } as Dish;

    return { data: processedData, error: null };
  } catch (error) {
    console.error('💥 Exception updating dish:', error);
    return { data: null, error };
  }
};

/**
 * Delete a dish
 * @param dishId - The dish ID to delete
 */
export const deleteDish = async (
  dishId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    console.log('🗑️ Deleting dish:', dishId);

    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dishId);

    if (error) {
      console.error('❌ Error deleting dish:', error);
      return { success: false, error };
    }

    console.log('✅ Dish deleted successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('💥 Exception deleting dish:', error);
    return { success: false, error };
  }
};

/**
 * Toggle dish visibility
 * @param dishId - The dish ID
 * @param isVisible - New visibility state
 */
export const toggleDishVisibility = async (
  dishId: string,
  isVisible: boolean
): Promise<{ data: Dish | null; error: any }> => {
  return updateDish(dishId, { is_visible: isVisible });
};

/**
 * Upload dish image to Supabase Storage
 * @param file - The image file (base64 or blob)
 * @param fileName - The file name
 */
export const uploadDishImage = async (
  fileUri: string,
  fileName: string
): Promise<{ url: string | null; error: any }> => {
  try {
    console.log('📤 Uploading dish image:', fileName);

    // Fetch the file and convert to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('dishes')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('❌ Error uploading image:', error);
      return { url: null, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('dishes')
      .getPublicUrl(data.path);

    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('💥 Exception uploading image:', error);
    return { url: null, error };
  }
};
