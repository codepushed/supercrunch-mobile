import { Order } from '@/lib/supabase';
import { fetchPendingOrders } from '@/services/orders';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');


export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 40));
    setCurrentIndex(index);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Fetch orders from Supabase
  const loadOrders = async () => {
    try {
      console.log('🔄 Starting to fetch orders from Supabase...');
      setError(null);
      const { data, error: fetchError } = await fetchPendingOrders();
      
      console.log('📦 Fetch result:', { data, error: fetchError });
      
      if (fetchError) {
        console.error('❌ Error loading orders:', fetchError);
        setError('Failed to load orders');
        return;
      }

      if (data) {
        console.log('✅ Orders loaded successfully:', data.length, 'orders');
        console.log('📋 First order:', data[0]);
        setOrders(data);
      } else {
        console.log('⚠️ No data returned from Supabase');
      }
    } catch (err) {
      console.error('💥 Exception loading orders:', err);
      setError('Failed to load orders');
    } finally {
      console.log('🏁 Finished loading orders');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section with Girl Image */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/v1/headerGirlImage.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Super Crunch Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/v1/splash.png')}
              style={styles.logo}
            />
          </View>

          {/* Check Orders Section */}
          <View style={styles.ordersSection}>
            <Text style={styles.checkOrdersText}>Check your Orders</Text>
            <Text style={styles.dateTimeText}>{getCurrentDateTime()}</Text>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFBE0C" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity onPress={loadOrders} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pending orders</Text>
                <Text style={styles.emptySubtext}>Pull down to refresh</Text>
              </View>
            )}

            {/* Order Cards Carousel */}
            {!loading && !error && orders.length > 0 && (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  style={styles.carouselContainer}
                  contentContainerStyle={styles.carouselContent}
                >
                  {orders.map((order, index) => (
                    <TouchableOpacity 
                      key={order.id} 
                      style={styles.orderCard}
                      onPress={() => router.push({
                        pathname: '/order-details',
                        params: { orderId: order.id }
                      })}
                    >
                      <Image
                        source={require('../assets/v1/cardImage.png')}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.orderDetails}>
                        <Text style={styles.orderNumber}>{order.order_number}</Text>
                        <Text style={styles.customerName}>{order.customer_name}</Text>
                        <Text style={styles.phoneNumber}>{order.customer_phone}</Text>
                        <Text style={styles.address}>{order.customer_address}</Text>
                        <Text style={styles.totalAmount}>₹{order.total}</Text>
                      </View>
                      {order.status === 'delivered' ? (
                        <View style={styles.deliveredBadge}>
                          <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
                        </View>
                      ) : (
                        <View style={styles.arrowContainer}>
                          <Image
                            source={require('../assets/v1/arrow.png')}
                            resizeMode="cover"
                            style={styles.arrow}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Carousel Dots */}
                <View style={styles.dotsContainer}>
                  {orders.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentIndex === index ? styles.activeDot : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFBE0C',
  },
  headerContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#FFBE0C',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
    minHeight: 800, // Increased height to ensure scrolling
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    // marginBottom: 40,
    width: '100%',
    height: 200, // Fixed height instead of percentage
    marginBottom: 20,
  },
  superText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -2,
    lineHeight: 48,
  },
  crunchText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#000000',
    letterSpacing: 1,
    marginTop: -8,
  },
  ordersSection: {
    flex: 1,
  },
  checkOrdersText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  arrow: {
    width: 20,
    height: 20,
  },
  orderCard: {
    width: width - 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginRight: 20,
  },
  cardImage: {
    width: '100%',
    height: 220,
    borderRadius: 15,
  },
  orderDetails: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFBE0C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFBE0C',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFBE0C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFBE0C',
    marginTop: 8,
  },
});
