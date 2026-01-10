import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: any;
  isVisible: boolean;
}

interface EditDishModalProps {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onUpdate: (item: MenuItem) => void;
}

export default function EditDishModal({
  visible,
  item,
  onClose,
  onUpdate,
}: EditDishModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [imageName, setImageName] = useState('Img.png');

  const isEditing = item !== null;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setDescription(item.description);
      setIsVisible(item.isVisible);
      setImageName('Img.png');
    } else {
      // Reset fields for new item
      setName('');
      setPrice('');
      setDescription('');
      setIsVisible(true);
      setImageName('');
    }
  }, [item]);

  const handleSave = () => {
    const newItem: MenuItem = {
      id: item?.id || '',
      name,
      price: parseFloat(price) || 0,
      description,
      image: item?.image || require('../assets/v1/cardImage.png'),
      isVisible,
    };
    onUpdate(newItem);
    onClose();
  };

  const handleUploadImage = () => {
    // TODO: Implement image picker
    console.log('Upload image');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{isEditing ? 'Edit dish' : 'Add dish'}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Image Preview */}
            <View style={styles.imagePreview}>
              {item?.image ? (
                <Image
                  source={item.image}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={48} color="#666666" />
                </View>
              )}
            </View>

            {/* Upload Image Section */}
            <Text style={styles.label}>Upload Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
              <Text style={styles.uploadFileName}>{imageName}</Text>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={20} color="#000000" />
              </View>
            </TouchableOpacity>

            {/* Dish Name */}
            <Text style={styles.label}>Dish Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter dish name"
              placeholderTextColor="#999999"
            />

            {/* Price */}
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Visible Toggle */}
            <View style={styles.visibleRow}>
              <Text style={styles.visibleLabel}>Visible</Text>
              <Switch
                value={isVisible}
                onValueChange={setIsVisible}
                trackColor={{ false: '#1A1A1A', true: '#1A1A1A' }}
                thumbColor={isVisible ? '#FFBE0C' : '#666666'}
                ios_backgroundColor="#1A1A1A"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
                <Text style={styles.updateButtonText}>{isEditing ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '90%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  uploadFileName: {
    fontSize: 14,
    color: '#000000',
  },
  uploadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  visibleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  visibleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#FFBE0C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  updateButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});
