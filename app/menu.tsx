import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: any;
  isVisible: boolean;
}

const sampleMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Potato Shots with Fiery Chilli Mayo',
    price: 49.00,
    description: 'A vibrant fusion of zesty citrus and cool blue refreshing taste that delights your senses...',
    image: require('../assets/v1/cardImage.png'),
    isVisible: true,
  },
  {
    id: '2',
    name: 'Potato Shots with Fiery Chilli Mayo',
    price: 49.00,
    description: 'A vibrant fusion of zesty citrus and cool blue refreshing taste that delights your senses...',
    image: require('../assets/v1/cardImage.png'),
    isVisible: true,
  },
  {
    id: '3',
    name: 'Potato Shots with Fiery Chilli Mayo',
    price: 49.00,
    description: 'A vibrant fusion of zesty citrus and cool blue refreshing taste that delights your senses...',
    image: require('../assets/v1/cardImage.png'),
    isVisible: false,
  },
  {
    id: '4',
    name: 'Potato Shots with Fiery Chilli Mayo',
    price: 49.00,
    description: 'A vibrant fusion of zesty citrus and cool blue refreshing taste that delights your senses...',
    image: require('../assets/v1/cardImage.png'),
    isVisible: true,
  },
];

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems);

  const toggleVisibility = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    );
  };

  const handleEdit = (id: string) => {
    console.log('Edit item:', id);
  };

  const handleDelete = (id: string) => {
    setMenuItems(items => items.filter(item => item.id !== id));
  };

  const handleAddNew = () => {
    console.log('Add new item');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
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
          {/* Title */}
          <Text style={styles.pageTitle}>Customize menu</Text>
          <Text style={styles.pageSubTitle}>You can edit, delete or add new items here</Text>

          {/* Menu Items List */}
          <View style={styles.menuList}>
            {menuItems.map(item => (
              <View key={item.id} style={styles.menuCard}>
                <View style={styles.menuCardContent}>
                  {/* Product Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.image}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(item.id)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>

                      {/* Visibility Toggle */}
                      <TouchableOpacity
                        style={styles.visibilityButton}
                        onPress={() => toggleVisibility(item.id)}
                      >
                        <Ionicons
                          name={item.isVisible ? 'eye' : 'eye-off'}
                          size={28}
                          color="#FFBE0C"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.productDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>

          </View>
      </ScrollView>

      {/* Floating Add New Button */}
      <TouchableOpacity style={styles.addNewButton} onPress={handleAddNew}>
        <View style={styles.addNewIcon}>
          <Ionicons name="add" size={24} color="#FFBE0C" />
        </View>
        <Text style={styles.addNewText}>Add New</Text>
      </TouchableOpacity>
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
    minHeight: 900,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: -15,
  },
  pageSubTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 20,
  },
  menuList: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 12,
  },
  menuCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#FFBE0C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityButton: {
    marginLeft: 'auto',
  },
  productDescription: {
    fontSize: 16,
    color: '#FFBE0C',
    marginTop: 12,
    fontWeight: '500',
  },
  addNewButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFBE0C',
    paddingRight: 8,
    paddingLeft: 3,
    paddingVertical: 3,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addNewIcon: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
