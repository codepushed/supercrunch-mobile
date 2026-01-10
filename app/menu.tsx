import EditDishModal from '@/components/EditDishModal';
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const toggleVisibility = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    );
  };

  const handleEdit = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (item) {
      setSelectedItem(item);
      setEditModalVisible(true);
    }
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setMenuItems(items => items.filter(item => item.id !== id));
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setEditModalVisible(true);
  };

  const handleSaveItem = (item: MenuItem) => {
    if (selectedItem) {
      // Update existing item
      setMenuItems(items =>
        items.map(i => (i.id === item.id ? item : i))
      );
    } else {
      // Add new item
      const newItem = {
        ...item,
        id: Date.now().toString(),
      };
      setMenuItems(items => [...items, newItem]);
    }
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
          {/* Title Header with Add New Button */}
          <View style={styles.titleHeader}>
            <View>
              <Text style={styles.pageTitle}>Customize menu</Text>
              <Text style={styles.pageSubTitle}>You can edit, delete or add new items here</Text>
            </View>
            <TouchableOpacity style={styles.addNewButton} onPress={handleAddNew}>
              <View style={styles.addNewIcon}>
                <Ionicons name="add" size={16} color="#FFBE0C" />
              </View>
              <Text style={styles.addNewText}>Add New</Text>
            </TouchableOpacity>
          </View>

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

      {/* Edit Dish Modal */}
      <EditDishModal
        visible={editModalVisible}
        item={selectedItem}
        onClose={() => setEditModalVisible(false)}
        onUpdate={handleSaveItem}
      />
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
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: 15,
    color: '#000',
    marginTop: 12,
    fontWeight: '300',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFBE0C',
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: 24,
    gap: 8,
  },
  addNewIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
