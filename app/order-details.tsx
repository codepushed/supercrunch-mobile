import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  
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
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.content}>
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
        <TouchableOpacity style={styles.deliveredButton}>
          <Text style={styles.deliveredButtonText}>Delivered ?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentButton}>
          <Text style={styles.paymentButtonText}>Take Payment</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#2196F3',
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
});
