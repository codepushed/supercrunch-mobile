import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Static data for order cards
const orderData = [
  {
    id: 1,
    orderNo: '#187832',
    customerName: 'Shubham Mehra',
    phone: '9617373159',
    address: 'A1206',
    image: require('../assets/v1/cardImage.png'),
  },
  {
    id: 2,
    orderNo: '#187833',
    customerName: 'John Doe',
    phone: '9876543210',
    address: 'B2304',
    image: require('../assets/v1/cardImage.png'),
  },
  {
    id: 3,
    orderNo: '#187834',
    customerName: 'Jane Smith',
    phone: '8765432109',
    address: 'C1205',
    image: require('../assets/v1/cardImage.png'),
  },
];

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

            {/* Order Cards Carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carouselContainer}
              contentContainerStyle={styles.carouselContent}
            >
              {orderData.map((order, index) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => router.push('/order-details')}
                >
                  <Image
                    source={order.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderNumber}>Order no: {order.orderNo}</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.phoneNumber}>{order.phone}</Text>
                    <Text style={styles.address}>{order.address}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Image
                      source={require('../assets/v1/arrow.png')}
                      resizeMode="cover"
                      style={styles.arrow}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Carousel Dots */}
            <View style={styles.dotsContainer}>
              {orderData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
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
    minHeight: 600,
  },
  logoContainer: {
    alignItems: 'center',
    // marginBottom: 40,
    width: '100%',
    height: '30%',
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
});
