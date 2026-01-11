/**
 * Push Notifications Service
 * Handles FCM token registration and notification listeners
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface DeviceToken {
  id?: string;
  token: string;
  device_name: string;
  platform: 'ios' | 'android';
  created_at?: string;
  last_active_at?: string;
}

/**
 * Register for push notifications and get FCM token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the native device push token (FCM for Android, APNs for iOS)
  try {
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    console.log('Device Push Token:', devicePushToken.data);

    // Android-specific channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'New Orders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFBE0C',
      });
    }

    return devicePushToken.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Save device token to Supabase
 */
export async function saveDeviceToken(token: string): Promise<void> {
  const deviceName = Device.deviceName || 'Unknown Device';
  const platform = Platform.OS as 'ios' | 'android';

  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        token,
        device_name: deviceName,
        platform,
        last_active_at: new Date().toISOString(),
      },
      {
        onConflict: 'token',
      }
    );

  if (error) {
    console.error('Error saving device token:', error);
  } else {
    console.log('Device token saved successfully');
  }
}

/**
 * Remove device token from Supabase (for logout/unregister)
 */
export async function removeDeviceToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('Error removing device token:', error);
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get last notification response (for cold start)
 */
export async function getLastNotificationResponseAsync() {
  return Notifications.getLastNotificationResponseAsync();
}
