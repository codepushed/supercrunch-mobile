import { fetchRestaurantStatus, updateRestaurantStatus } from '@/services/restaurant';
import { router, usePathname } from 'expo-router';
import { Calculator, Home, Soup, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabName = 'home' | 'orders' | 'toggle' | 'analytics' | 'calculator';

export default function BottomNavigation() {
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Fetch restaurant status on mount
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      const { data } = await fetchRestaurantStatus();
      setIsToggleOn(data);
      setIsLoading(false);
    };
    loadStatus();
  }, []);

  // Determine active tab based on current route
  const getActiveTab = (): TabName => {
    if (pathname === '/' || pathname === '/index') return 'home';
    if (pathname === '/menu') return 'orders';
    if (pathname === '/expenses' || pathname === '/add-expense') return 'calculator';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabPress = async (tab: TabName) => {
    if (tab === 'toggle') {
      if (isLoading) return; // Prevent multiple clicks while loading

      setIsLoading(true);
      const newStatus = !isToggleOn;

      // Optimistically update UI
      setIsToggleOn(newStatus);

      const { data, error } = await updateRestaurantStatus(newStatus);

      if (error) {
        // Revert on error
        setIsToggleOn(!newStatus);
        alert('Failed to update restaurant status');
      }

      setIsLoading(false);
      return;
    }

    // Navigate based on tab
    switch (tab) {
      case 'home':
        router.push('/');
        break;
      case 'orders':
        router.push('/menu');
        break;
      case 'analytics':
        // TODO: Add analytics route
        break;
      case 'calculator':
        router.push('/expenses');
        break;
    }
  };

  const renderIcon = (tab: TabName) => {
    const iconProps = { size: 24, color: '#FFFFFF', strokeWidth: 2 };

    switch (tab) {
      case 'home':
        return <Home {...iconProps} />;
      case 'orders':
        return <Soup {...iconProps} />;
      case 'analytics':
        return <TrendingUp {...iconProps} />;
      case 'calculator':
        return <Calculator {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Home */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('home')}
      >
        {activeTab === 'home' && <View style={styles.activeIndicator} />}
        <View style={styles.iconContainer}>
          {renderIcon('home')}
        </View>
      </TouchableOpacity>

      {/* Orders */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('orders')}
      >
        {activeTab === 'orders' && <View style={styles.activeIndicator} />}
        <View style={styles.iconContainer}>
          {renderIcon('orders')}
        </View>
      </TouchableOpacity>

      {/* Toggle Switch */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => handleTabPress('toggle')}
        disabled={isLoading}
      >
        <View style={[styles.toggleTrack, isToggleOn && styles.toggleTrackOn, isLoading && styles.toggleTrackLoading]}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFBE0C" style={styles.toggleLoader} />
          ) : (
            <View style={[styles.toggleThumb, isToggleOn && styles.toggleThumbOn]} />
          )}
        </View>
      </TouchableOpacity>

      {/* Analytics */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('analytics')}
      >
        {activeTab === 'analytics' && <View style={styles.activeIndicator} />}
        <View style={styles.iconContainer}>
          {renderIcon('analytics')}
        </View>
      </TouchableOpacity>

      {/* Calculator */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('calculator')}
      >
        {activeTab === 'calculator' && <View style={styles.activeIndicator} />}
        <View style={styles.iconContainer}>
          {renderIcon('calculator')}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFBE0C',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 28,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
    marginBottom: 6,
    position: 'absolute',
    top: -14,
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleTrack: {
    width: 80,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleTrackOn: {
    backgroundColor: '#1A1A1A',
  },
  toggleThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A3A3A',
    position: 'absolute',
    left: 4,
  },
  toggleThumbOn: {
    left: 40,
    backgroundColor: '#fff',
  },
  toggleTrackLoading: {
    opacity: 0.7,
  },
  toggleLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
