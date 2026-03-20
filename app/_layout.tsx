import BottomNavigation from '@/components/BottomNavigation';
import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

function AppContent() {
  // Initialize order notifications (vibration + toast)
  useOrderNotifications();

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="menu" options={{ headerShown: false }} />
        <Stack.Screen name="order-details" options={{ headerShown: false }} />
        <Stack.Screen name="expenses" options={{ headerShown: false }} />
        <Stack.Screen name="add-expense" options={{ headerShown: false }} />
      </Stack>
      <BottomNavigation />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
 
