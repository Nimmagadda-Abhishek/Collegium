// edit-profile.tsx - Responsive with validation
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
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Github, Linkedin, MapPin, BookOpen, GraduationCap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  if (!user) return null;

  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [university, setUniversity] = useState(user.university || '');
  const [major, setMajor] = useState(user.major || '');
  const [year, setYear] = useState(user.year || '');
  const [githubLinked, setGithubLinked] = useState(!!user.githubUsername);
  const [avatar, setAvatar] = useState(user.avatar || '');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const getResponsiveMargin = () => {
    if (screenWidth < 768) return 0;
    if (screenWidth < 1024) return 100;
    return Math.max(200, (screenWidth - 1000) / 2);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      bio,
      university,
      major,
      year,
      githubUsername: githubLinked ? user.githubUsername || 'githubUser' : null,
      avatar,
    };

    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleLinkGithub = () => {
    if (githubLinked) {
      Alert.alert('Unlink GitHub?', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlink', style: 'destructive', onPress: () => setGithubLinked(false) },
      ]);
    } else {
      Alert.alert('GitHub linked!');
      setGithubLinked(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={{ paddingHorizontal: getResponsiveMargin() }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <Animated.View style={[styles.avatarSection, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleAvatarChange}
            activeOpacity={0.7}
          >
            <Camera size={20} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>

        {/* University */}
        <View style={styles.section}>
          <Text style={styles.label}>University</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.inputWithIcon}
              value={university}
              onChangeText={setUniversity}
              placeholder="Your university"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Major */}
        <View style={styles.section}>
          <Text style={styles.label}>Major</Text>
          <View style={styles.inputContainer}>
            <BookOpen size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.inputWithIcon}
              value={major}
              onChangeText={setMajor}
              placeholder="Your major"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Year */}
        <View style={styles.section}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.inputContainer}>
            <GraduationCap size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.inputWithIcon}
              value={year}
              onChangeText={setYear}
              placeholder="e.g., Junior, Senior"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Connected Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <Text style={styles.sectionDescription}>
            Link your social accounts to showcase your work and connect with others
          </Text>

          {/* GitHub */}
          <TouchableOpacity
            style={[styles.linkButton, githubLinked && styles.linkButtonConnected]}
            onPress={handleLinkGithub}
            activeOpacity={0.7}
          >
            <View style={styles.linkButtonLeft}>
              <View
                style={[
                  styles.linkIconContainer,
                  { backgroundColor: githubLinked ? '#24292e' : Colors.backgroundSecondary },
                ]}
              >
                <Github size={24} color={githubLinked ? Colors.white : Colors.text} />
              </View>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>GitHub</Text>
                <Text style={styles.linkDescription}>
                  {githubLinked ? 'Connected' : 'Connect your GitHub account'}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.linkButtonText, githubLinked && styles.linkButtonTextConnected]}
            >
              {githubLinked ? 'Unlink' : 'Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  saveButton: { fontSize: 16, fontWeight: '600', color: Colors.primary, marginRight: 16 },
  content: { flex: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.white,
    marginBottom: 16,
    borderRadius: 12,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  cameraButton: {
    position: 'absolute',
    bottom: 32,
    right: '50%',
    marginRight: -50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: {
    fontSize: 15,
    color: Colors.text,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    gap: 10,
  },
  inputWithIcon: { flex: 1, fontSize: 15, color: Colors.text },
  divider: { height: 8, backgroundColor: Colors.backgroundSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  linkButtonConnected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  linkButtonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  linkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkInfo: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  linkDescription: { fontSize: 13, color: Colors.textSecondary },
  linkButtonText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  linkButtonTextConnected: { color: Colors.error },
});