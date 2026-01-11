/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/api';

// Validate configuration
console.log('🔧 Initializing Supabase client...');
console.log('📡 Supabase URL:', SUPABASE_CONFIG.URL);
console.log('🔑 Anon Key length:', SUPABASE_CONFIG.ANON_KEY?.length || 0);

if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', SUPABASE_CONFIG.URL);
  console.error('Key exists:', !!SUPABASE_CONFIG.ANON_KEY);
  console.warn('⚠️ Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
} else {
  console.log('✅ Supabase configuration loaded successfully');
}

// Create Supabase client
export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY,
  {
    auth: {
      persistSession: false, // We don't need auth session for admin app
    },
  }
);

console.log('✅ Supabase client created');

// Database types based on your schema
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  delivery_instructions: string | null;
  cooking_instructions: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

// Device token for push notifications
export interface DeviceToken {
  id: string;
  token: string;
  device_name: string;
  platform: 'ios' | 'android';
  created_at: string;
  last_active_at: string;
}

// Dish type for menu items (based on web project's dishes table)
export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  tags: string[];
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to format order status
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

// Helper function to get status color
export const getStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    preparing: '#9C27B0',
    ready: '#4CAF50',
    out_for_delivery: '#00BCD4',
    delivered: '#4CAF50',
    cancelled: '#F44336',
  };
  return colorMap[status] || '#666';
};
