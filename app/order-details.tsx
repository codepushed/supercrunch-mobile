import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const confettiRef = useRef<any>(null);
  
  // Mock data - in a real app, you'd fetch this based on the order ID
  const orderData = {
    id: '#12345',
    date: 'Monday 13 June',
    time: '12:03 PM',
    status: 'Delivered',
    customerName: 'Shubham Mehra',
    phone: '9617373159',
    address: 'A1206',
    paymentMethod: 'UPI 9617373159@ybl',
    items: [
      { name: 'White Sauce Pasta x2', price: 79 },
      { name: 'Red Sauce Pasta x2', price: 89 },
    ],
    total: 89,
    deliveryInstructions: "Don't press the bell, Just text.",
  };

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
              <Text style={styles.orderId}>Order Id {orderData.id}</Text>
              <Text style={styles.orderDate}>{orderData.date}</Text>
              <Text style={styles.orderTime}>{orderData.time}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>{orderData.status}</Text>
            </View>
          </View>

          {/* Delivered To Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivered to</Text>
            <Text style={styles.customerName}>{orderData.customerName}</Text>
            <Text style={styles.customerInfo}>{orderData.phone}</Text>
            <Text style={styles.customerInfo}>{orderData.address}</Text>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Text style={styles.paymentMethod}>{orderData.paymentMethod}</Text>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITEMS</Text>
            {orderData.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{orderData.total}</Text>
            </View>
          </View>

          {/* Delivery Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
            <Text style={styles.instructions}>{orderData.deliveryInstructions}</Text>
          </View>
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
              onPress={() => {
                setDeliveryModalVisible(false);
                confettiRef.current?.start();
                setTimeout(() => router.back(), 2000);
              }}
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
            
            <Text style={styles.paymentTitle}>Shubham - ICICI</Text>
            
            {/* QR Code Placeholder */}
            <View style={styles.qrContainer}>
             <Image
              source={require('../assets/v1/qr.png')}
              style={styles.qrCode}
              resizeMode="cover"
            />
            </View>
            
       
              <Text style={styles.copyButtonText}>Copy UPI ID</Text>
            
            
            {/* Carousel dots */}
            <View style={styles.modalDotsContainer}>
              <View style={[styles.modalDot, styles.activeModalDot]} />
              <View style={[styles.modalDot, styles.inactiveModalDot]} />
              <View style={[styles.modalDot, styles.inactiveModalDot]} />
            </View>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCode: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
});
