/**
 * Orders Service
 * Handles all order-related API calls to Supabase
 */

import { Order, OrderStatus, supabase } from '@/lib/supabase';

/**
 * Fetch all orders, sorted by most recent first
 * @param limit - Number of orders to fetch (default: 50)
 * @param status - Filter by status (optional)
 */
export const fetchOrders = async (
  limit: number = 50,
  status?: OrderStatus
): Promise<{ data: Order[] | null; error: any }> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return { data: null, error };
    }

    console.log('Orders fetched successfully:', data);

    return { data: data as Order[], error: null };
  } catch (error) {
    console.error('Exception fetching orders:', error);
    return { data: null, error };
  }
};

/**
 * Fetch a single order by ID
 * @param orderId - The order ID
 */
export const fetchOrderById = async (
  orderId: string
): Promise<{ data: Order | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return { data: null, error };
    }

    return { data: data as Order, error: null };
  } catch (error) {
    console.error('Exception fetching order:', error);
    return { data: null, error };
  }
};

/**
 * Fetch pending orders (orders that need attention)
 */
export const fetchPendingOrders = async (): Promise<{
  data: Order[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending orders:', error);
      return { data: null, error };
    }

    return { data: data as Order[], error: null };
  } catch (error) {
    console.error('Exception fetching pending orders:', error);
    return { data: null, error };
  }
};

/**
 * Update order status
 * @param orderId - The order ID
 * @param status - New status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<{ data: Order | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return { data: null, error };
    }

    return { data: data as Order, error: null };
  } catch (error) {
    console.error('Exception updating order status:', error);
    return { data: null, error };
  }
};

/**
 * Subscribe to real-time order changes
 * @param callback - Function to call when orders change
 */
export const subscribeToOrders = (
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time order changes
 */
export const unsubscribeFromOrders = async (subscription: any) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
};
