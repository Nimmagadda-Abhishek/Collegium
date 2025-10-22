// create-post.tsx - Responsive with animations
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  FlatList,
  Dimensions,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import {
  X,
  ImagePlus,
  MapPin,
  Lock,
  Globe,
  UserPlus,
  Users,
  Filter,
  Hash,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const friends = [
  { id: 1, name: 'Abhishek' },
  { id: 2, name: 'Kiran' },
  { id: 3, name: 'Anil' },
  { id: 4, name: 'Priya' },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [collabs, setCollabs] = useState<number[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const collabHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    Animated.timing(collabHeight, {
      toValue: showFriends ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFriends]);

  const getResponsiveMargin = () => {
    if (screenWidth < 768) return 0;
    if (screenWidth < 1024) return 100;
    return Math.max(200, (screenWidth - 1000) / 2);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Please allow access to photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets.map((a) => a.uri);
      setImages([...images, ...selected]);
    }
  };

  const handleRemoveImage = (index: number) =>
    setImages(images.filter((_, i) => i !== index));

  const applyFilter = () => {
    Alert.alert('Filters', 'Simple filter applied to all images ✨');
  };

  const toggleCollab = (id: number) => {
    setCollabs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePost = () => {
    if (!caption.trim() && images.length === 0) {
      Alert.alert('Error', 'Add a caption or image before posting');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Posted!',
        `Post shared ${isPublic ? 'publicly' : 'privately'} with ${
          collabs.length > 0 ? collabs.length + ' collaborators' : 'no collaborators'
        }`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const collabHeightInterpolate = collabHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'New Post',
          headerRight: () => (
            <TouchableOpacity
              onPress={handlePost}
              disabled={loading || (!caption.trim() && images.length === 0)}
              style={[
                styles.postButton,
                (loading || (!caption.trim() && images.length === 0)) && {
                  opacity: 0.6,
                },
              ]}
            >
              <Text style={styles.postButtonText}>
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: getResponsiveMargin() },
        ]}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Caption */}
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption... #fun #travel @friends"
          placeholderTextColor={Colors.textSecondary}
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        {/* Images Preview */}
        {images.length > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={images}
            contentContainerStyle={styles.imagesList}
            renderItem={({ item, index }) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                  activeOpacity={0.7}
                >
                  <X size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Image Buttons */}
        <View style={styles.imageActionRow}>
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={pickImages}
            activeOpacity={0.7}
          >
            <ImagePlus size={22} color={Colors.primary} />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={applyFilter}
              activeOpacity={0.7}
            >
              <Filter size={20} color={Colors.primary} />
              <Text style={styles.addImageText}>Apply Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        <View style={styles.optionRow}>
          <Hash size={20} color={Colors.primary} />
          <TextInput
            placeholder="Add hashtags (#travel, #fun)"
            placeholderTextColor={Colors.textSecondary}
            style={styles.optionInput}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Location */}
        <View style={styles.optionRow}>
          <MapPin size={20} color={Colors.primary} />
          <TextInput
            placeholder="Add location"
            placeholderTextColor={Colors.textSecondary}
            style={styles.optionInput}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Collaboration */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowFriends(!showFriends)}
          activeOpacity={0.7}
        >
          <UserPlus size={20} color={Colors.primary} />
          <Text style={styles.optionLabel}>Add Collaborators</Text>
          <Users size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Animated.View style={{ height: collabHeightInterpolate, overflow: 'hidden' }}>
          <View style={styles.collabList}>
            {friends.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.collabItem,
                  collabs.includes(f.id) && styles.collabSelected,
                ]}
                onPress={() => toggleCollab(f.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.collabName,
                    collabs.includes(f.id) && { color: Colors.white },
                  ]}
                >
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Visibility */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Visibility</Text>
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setIsPublic(!isPublic)}
            activeOpacity={0.7}
          >
            {isPublic ? (
              <>
                <Globe size={18} color={Colors.primary} />
                <Text style={styles.visibilityText}>Public</Text>
              </>
            ) : (
              <>
                <Lock size={18} color={Colors.primary} />
                <Text style={styles.visibilityText}>Private</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Story Switch */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Share to Story</Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Cancel Post Button */}
        <TouchableOpacity
          style={styles.cancelPostButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelPostText}>Cancel Post</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: {
    paddingBottom: 40,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  postButtonText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary },
  captionInput: {
    fontSize: 16,
    color: Colors.text,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagesList: {
    paddingHorizontal: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: { width: 130, height: 130, borderRadius: 12 },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  addImageText: { color: Colors.primary, fontWeight: '600', marginLeft: 6 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionLabel: { fontSize: 15, color: Colors.text, flex: 1, marginLeft: 10 },
  optionInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  collabList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  collabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
  },
  collabSelected: {
    backgroundColor: Colors.primary,
  },
  cancelPostButton: {
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelPostText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  collabName: { color: Colors.text },
  visibilityToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visibilityText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
});