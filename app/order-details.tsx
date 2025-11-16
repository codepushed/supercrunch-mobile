import { Order, formatOrderStatus, getStatusColor } from '@/lib/supabase';
import { fetchOrderById, updateOrderStatus } from '@/services/orders';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import Share, { ShareSingleOptions, Social } from 'react-native-share';

type WhatsAppShareOptions = ShareSingleOptions & { whatsAppNumber?: string };

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrIndex, setQrIndex] = useState(0);
  const confettiRef = useRef<any>(null);
  const qrScrollRef = useRef<ScrollView | null>(null);

  const qrOptions = [
    {
      label: 'BOI',
      source: require('../assets/qr/boi.jpg'),
    },
    {
      label: 'ICICI',
      source: require('../assets/qr/icici.jpg'),
    },
  ];

  const normalizePhoneNumber = (phoneNumber: string) => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.startsWith('91')) {
      return digitsOnly;
    }
    if (digitsOnly.length === 10) {
      return `91${digitsOnly}`;
    }
    return digitsOnly;
  };

  const shareImageWithMessage = async (
    phoneNumber: string,
    message: string,
    imageAsset: number,
  ) => {
    try {
      const asset = Asset.fromModule(imageAsset);
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      const assetUri = asset.localUri ?? asset.uri;
      if (!assetUri) {
        throw new Error('Image asset unavailable');
      }

      const normalizedNumber = normalizePhoneNumber(phoneNumber);

      const shareOptions: WhatsAppShareOptions = {
        social: Social.Whatsapp,
        message,
        url: assetUri,
        whatsAppNumber: normalizedNumber,
        type: 'image/*',
      };

      if (Platform.OS === 'ios' && assetUri.startsWith('file://')) {
        shareOptions.url = assetUri;
      }

      await Share.shareSingle(shareOptions);
    } catch (error) {
      console.error('Error sharing image via WhatsApp:', error);
      alert('Failed to share image via WhatsApp. Sending text message instead.');
      await sendWhatsAppMessage(phoneNumber, message);
    }
  };

  // WhatsApp sharing functions
  const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
    try {
      const normalizedNumber = normalizePhoneNumber(phoneNumber);
      const url = `whatsapp://send?phone=${normalizedNumber}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      alert('Failed to share via WhatsApp');
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;
    setMenuModalVisible(false);
    const message = "Order locked in! We've started prepping your yummy meal";
    const imageAsset = require('../assets/quickies/confirm.png');
    await shareImageWithMessage(order.customer_phone, message, imageAsset);
  };

  const handleSendReview = async () => {
    if (!order) return;
    setMenuModalVisible(false);
    const message = "Your feedback is the secret ingredient that helps us get better. Tell us how your food was!";
    const imageAsset = require('../assets/quickies/review.jpg');
    await shareImageWithMessage(order.customer_phone, message, imageAsset);
  };

  const handleAlmostThere = () => {
    if (!order) return;
    setMenuModalVisible(false);
    const message = "Your food is just a few bites away from reaching you";
    sendWhatsAppMessage(order.customer_phone, message);
  };
  
  // Fetch order data from Supabase
  useEffect(() => {
    const loadOrder = async () => {
      if (!params.orderId) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await fetchOrderById(params.orderId as string);
        
        if (fetchError) {
          console.error('Error loading order:', fetchError);
          setError('Failed to load order');
          return;
        }

        if (data) {
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Exception loading order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.orderId]);

  // Handle order delivery
  const handleDelivered = async () => {
    if (!order) return;

    try {
      const { error } = await updateOrderStatus(order.id, 'delivered');
      
      if (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order status');
        return;
      }

      // Update local order state to reflect delivered status
      setOrder({ ...order, status: 'delivered' });
      setDeliveryModalVisible(false);
      confettiRef.current?.start();
      setTimeout(() => router.back(), 2000);
    } catch (err) {
      console.error('Exception updating order:', err);
      alert('Failed to update order status');
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions),
    };
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFBE0C" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error || 'Order not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonStyle}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time } = formatDateTime(order.created_at);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuModalVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Decorative Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/v1/cardImage.png')}
            style={styles.decorativeImage}
            resizeMode="cover"
          />
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoContainer}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>{order.order_number}</Text>
              <Text style={styles.orderDate}>{date}</Text>
              <Text style={styles.orderTime}>{time}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={order.status === 'delivered' ? 'checkmark-circle' : 'time-outline'} 
                size={20} 
                color={getStatusColor(order.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {formatOrderStatus(order.status)}
              </Text>
            </View>
          </View>

          {/* Delivered To Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivered to</Text>
            <Text style={styles.customerName}>{order.customer_name}</Text>
            <Text style={styles.customerInfo}>{order.customer_phone}</Text>
            <Text style={styles.customerInfo}>{order.customer_address}</Text>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Text style={styles.paymentMethod}>Cash on Delivery</Text>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITEMS</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}
            {order.discount > 0 && (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Discount</Text>
                <Text style={[styles.itemPrice, { color: '#4CAF50' }]}>-₹{order.discount}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₹{order.total}</Text>
            </View>
          </View>

          {/* Delivery Instructions */}
          {order.delivery_instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Instructions</Text>
              <Text style={styles.instructions}>{order.delivery_instructions}</Text>
            </View>
          )}

          {/* Cooking Instructions */}
          {order.cooking_instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cooking Instructions</Text>
              <Text style={styles.instructions}>{order.cooking_instructions}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.deliveredButton}
          onPress={() => setDeliveryModalVisible(true)}
        >
          <Text style={styles.deliveredButtonText}>Delivered ?</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={() => setPaymentModalVisible(true)}
        >
          <Text style={styles.paymentButtonText}>Take Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deliveryModalVisible}
        onRequestClose={() => setDeliveryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deliveryModal}>
            <TouchableOpacity 
              style={styles.deliveredSuccessButton}
              onPress={handleDelivered}
            >
              <Text style={styles.deliveredSuccessText}>Delivered Successfully</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelledButton}
              onPress={() => setDeliveryModalVisible(false)}
            >
              <Text style={styles.cancelledText}>Cancelled</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment QR Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.paymentTitle}>Payment QR Codes</Text>

            <View style={styles.qrContainer}>
              <ScrollView
                ref={qrScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.qrScrollView}
                contentContainerStyle={styles.qrScrollContent}
                onMomentumScrollEnd={(event) => {
                  const { contentOffset, layoutMeasurement } = event.nativeEvent;
                  const nextIndex = Math.round(contentOffset.x / layoutMeasurement.width);
                  setQrIndex(nextIndex);
                }}
              >
                {qrOptions.map((qr) => (
                  <View key={qr.label} style={styles.qrSlide}>
                    <Text style={styles.qrLabel}>{qr.label}</Text>
                    <Image
                      source={qr.source}
                      style={styles.qrCode}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* <Text style={styles.copyButtonText}>Copy UPI ID</Text> */}

            <View style={styles.modalDotsContainer}>
              {qrOptions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.modalDot,
                    qrIndex === index ? styles.activeModalDot : styles.inactiveModalDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMenuModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.menuTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleConfirmOrder}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuOptionText}>Confirm Order</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleSendReview}
            >
              <Ionicons name="star-outline" size={24} color="#FF9800" />
              <Text style={styles.menuOptionText}>Send Review Request</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleAlmostThere}
            >
              <Ionicons name="bicycle-outline" size={24} color="#2196F3" />
              <Text style={styles.menuOptionText}>Almost There</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confetti Animation */}
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{x: -10, y: 0}}
        autoStart={false}
        fadeOut={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFBE0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  menuButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingBottom: 120, // Space for action buttons
  },
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  decorativeImage: {
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
  orderInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  instructions: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 15,
    backgroundColor: 'white',
  },
  deliveredButton: {
    backgroundColor: '#1D6A96',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveredButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: '#FFBE0C',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deliveryModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  deliveredSuccessButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveredSuccessText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelledButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelledText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  qrContainer: {
    width: '100%',
    marginBottom: 20,
  },
  qrCode: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
  qrItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  qrScrollView: {
    width: '100%',
  },
  qrScrollContent: {
    alignItems: 'center',
  },
  qrSlide: {
    width: 350,
    alignItems: 'center',
  },
  qrText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeModalDot: {
    backgroundColor: '#FFBE0C',
  },
  inactiveModalDot: {
    backgroundColor: '#E0E0E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButtonStyle: {
    backgroundColor: '#FFBE0C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  menuModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 12,
  },
});
