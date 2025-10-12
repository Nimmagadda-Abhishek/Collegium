import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, ImagePlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleAddImage = () => {
    const demoImages = [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    ];
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    setImages([...images, randomImage]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add some content or images to your post');
      return;
    }

    Alert.alert('Success', 'Post created successfully!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Post',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handlePost} style={styles.postButton}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={Colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
        />

        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <X size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
          <ImagePlus size={24} color={Colors.primary} />
          <Text style={styles.addImageText}>Add Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 16,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  addImageText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
