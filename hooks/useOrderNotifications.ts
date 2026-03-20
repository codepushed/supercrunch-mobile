/**
 * useOrderNotifications Hook
 * Manages real-time order notifications with vibration and toast
 * Works with Expo Go (no native build required)
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useToast } from '@/contexts/ToastContext';
import { subscribeToOrders, unsubscribeFromOrders } from '@/services/orders';
import { triggerOrderVibration } from '@/services/notifications';
import { Order } from '@/lib/supabase';

export function useOrderNotifications() {
  const { showToast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      console.log('Initializing order notifications...');

      // Subscribe to order changes via Supabase realtime
      subscriptionRef.current = subscribeToOrders(async (payload) => {
        if (!isMounted) return;

        console.log('Order change detected:', payload.eventType);

        // Only notify for new orders (INSERT events)
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          console.log('New order received:', newOrder.order_number);

          // Vibrate
          await triggerOrderVibration();

          // Show toast
          const itemCount = newOrder.items?.length || 0;
          const itemNames = newOrder.items?.slice(0, 2).map(item => item.name).join(', ') || 'items';

          showToast({
            title: `New Order #${newOrder.order_number}`,
            message: `${newOrder.customer_name} - ${itemCount} item(s): ${itemNames}`,
            type: 'order',
            duration: 6000,
          });
        }
      });

      console.log('Order notifications initialized');
    };

    initialize();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Cleanup on unmount
    return () => {
      isMounted = false;

      if (subscriptionRef.current) {
        console.log('Unsubscribing from orders...');
        unsubscribeFromOrders(subscriptionRef.current);
      }

      appStateSubscription.remove();
    };
  }, [showToast]);
}
