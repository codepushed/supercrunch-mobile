import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type TabName = 'home' | 'orders' | 'toggle' | 'analytics' | 'calculator';

interface BottomNavigationProps {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
}

export default function BottomNavigation({ activeTab = 'home', onTabPress }: BottomNavigationProps) {
  const [isToggleOn, setIsToggleOn] = useState(false);

  const handleTabPress = (tab: TabName) => {
    if (tab === 'toggle') {
      setIsToggleOn(!isToggleOn);
    }
    onTabPress?.(tab);
  };

  const renderIcon = (tab: TabName) => {
    switch (tab) {
      case 'home':
        return <Ionicons name="home-outline" size={28} color="#FFFFFF" />;
      case 'orders':
        return <MaterialCommunityIcons name="noodles" size={28} color="#FFFFFF" />;
      case 'analytics':
        return <Ionicons name="trending-up" size={28} color="#FFFFFF" />;
      case 'calculator':
        return <MaterialCommunityIcons name="calculator-variant-outline" size={26} color="#FFFFFF" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
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
      >
        <View style={[styles.toggleTrack, isToggleOn && styles.toggleTrackOn]}>
          <View style={[styles.toggleThumb, isToggleOn && styles.toggleThumbOn]} />
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
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
    backgroundColor: '#FFBE0C',
  },
});
