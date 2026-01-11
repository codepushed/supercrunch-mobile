/**
 * Custom hook for managing push notifications
 */

import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  registerForPushNotificationsAsync,
  saveDeviceToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from '@/services/notifications';

export interface NotificationData {
  type: 'new_order';
  orderId: string;
  orderNumber: string;
}

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setPushToken(token);
          saveDeviceToken(token);
        }
      })
      .catch((err) => console.error('Error registering for push:', err));

    // Handle notification received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Handle user tapping on notification
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      handleNotificationResponse(response);
    });

    // Check for notification that launched the app (cold start)
    getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Update token activity on app state change
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      pushToken
    ) {
      // Update last_active_at when app comes to foreground
      await saveDeviceToken(pushToken);
    }
    appState.current = nextAppState;
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;

    if (data?.type === 'new_order' && data?.orderId) {
      // Navigate to order details
      router.push({
        pathname: '/order-details',
        params: { orderId: data.orderId },
      });
    }
  };

  return {
    pushToken,
    notification,
  };
}
