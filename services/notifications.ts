/**
 * Notifications Service
 * Handles vibration for new orders (Expo Go compatible)
 * Uses Supabase realtime for order detection
 */

import * as Haptics from 'expo-haptics';
import { Alert, Vibration, Platform } from 'react-native';
import { Order } from '@/lib/supabase';

/**
 * Trigger vibration pattern for new order
 */
export const triggerOrderVibration = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      // Android: pattern [wait, vibrate, wait, vibrate, ...]
      Vibration.vibrate([0, 500, 200, 500, 200, 500], false);
    } else {
      // iOS: Use Haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 300);

      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 600);

      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 900);
    }

    console.log('Vibration triggered');
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
};

/**
 * Show in-app alert for new order
 */
export const showNewOrderAlert = (order: Order): void => {
  const itemCount = order.items?.length || 0;
  const itemNames = order.items?.slice(0, 3).map(item => item.name).join(', ') || 'items';
  const totalAmount = order.total || 0;

  Alert.alert(
    'New Order!',
    `${order.customer_name}\n${itemCount} item(s): ${itemNames}\nTotal: ₹${totalAmount}`,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

/**
 * Handle new order - vibrates and shows alert
 */
export const handleNewOrderNotification = async (order: Order): Promise<void> => {
  console.log('New order received:', order.order_number);

  // Vibrate
  await triggerOrderVibration();

  // Show alert after a small delay
  setTimeout(() => {
    showNewOrderAlert(order);
  }, 300);
};

/**
 * Initialize notifications (placeholder for future sound support)
 */
export const loadNotificationSound = async (): Promise<void> => {
  // Sound disabled for Expo Go compatibility
  console.log('Notifications initialized (vibration only mode)');
};

/**
 * Cleanup (placeholder)
 */
export const cleanupNotifications = async (): Promise<void> => {
  console.log('Notifications cleanup');
};
