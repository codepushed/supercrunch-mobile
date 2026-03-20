import EditDishModal from '@/components/EditDishModal';
import { Dish } from '@/lib/supabase';
import {
  createDish,
  deleteDish,
  fetchDishes,
  toggleDishVisibility,
  updateDish,
} from '@/services/dishes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dishes on mount
  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      const { data, error } = await fetchDishes();
      if (error) {
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error loading dishes:', err);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDishes();
  };

  const toggleVisibility = async (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    const newVisibility = !item.is_visible;

    // Optimistic update
    setMenuItems(items =>
      items.map(i => (i.id === id ? { ...i, is_visible: newVisibility } : i))
    );

    const { error } = await toggleDishVisibility(id, newVisibility);
    if (error) {
      // Revert on error
      setMenuItems(items =>
        items.map(i => (i.id === id ? { ...i, is_visible: !newVisibility } : i))
      );
      Alert.alert('Error', 'Failed to update visibility');
    }
  };

  const handleEdit = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (item) {
      setSelectedItem(item);
      setEditModalVisible(true);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Dish',
      'Are you sure you want to delete this dish?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deleteDish(id);
            if (success) {
              setMenuItems(items => items.filter(item => item.id !== id));
            } else {
              Alert.alert('Error', 'Failed to delete dish');
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setEditModalVisible(true);
  };

  const handleSaveItem = async (dishData: Partial<Dish>) => {
    if (selectedItem) {
      // Update existing item
      const { data, error } = await updateDish(selectedItem.id, {
        name: dishData.name,
        price: dishData.price,
        description: dishData.description,
        image_url: dishData.image_url,
        is_visible: dishData.is_visible,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update dish');
        return;
      }

      if (data) {
        setMenuItems(items =>
          items.map(i => (i.id === data.id ? data : i))
        );
      }
    } else {
      // Add new item
      const { data, error } = await createDish({
        name: dishData.name || '',
        price: dishData.price || 0,
        description: dishData.description || '',
        image_url: dishData.image_url || null,
        tags: [],
        is_visible: dishData.is_visible ?? true,
      });

      if (error) {
        Alert.alert('Error', 'Failed to create dish');
        return;
      }

      if (data) {
        setMenuItems(items => [data, ...items]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
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
              <Text style={styles.addNewText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFBE0C" />
              <Text style={styles.loadingText}>Loading menu items...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && menuItems.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No menu items yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add New" to create your first dish</Text>
            </View>
          )}

          {/* Menu Items List */}
          {!loading && menuItems.length > 0 && (
          <View style={styles.menuList}>
            {menuItems.map(item => (
              <View key={item.id} style={styles.menuCard}>
                <View style={styles.menuCardContent}>
                  {/* Product Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={
                        item.image_url
                          ? { uri: item.image_url }
                          : require('../assets/v1/cardImage.png')
                      }
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
                          name={item.is_visible ? 'eye' : 'eye-off'}
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
          )}

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
});
