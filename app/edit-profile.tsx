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
import * as ImagePicker from 'expo-image-picker';
import { Camera, Github, Linkedin, MapPin, BookOpen, GraduationCap, Edit2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  if (!user) return null; // Prevent undefined errors

  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [university, setUniversity] = useState(user.university || '');
  const [major, setMajor] = useState(user.major || '');
  const [year, setYear] = useState(user.year || '');
  const [githubLinked, setGithubLinked] = useState(!!user.githubUsername);
  // const [linkedinLinked, setLinkedinLinked] = useState(!!user.linkedinUsername);
  const [avatar, setAvatar] = useState(user.avatar || '');

  // Save profile
  const handleSave = () => {
    const updatedUser = {
      ...user,
      name,
      bio,
      university,
      major,
      year,
      githubUsername: githubLinked ? user.githubUsername || 'githubUser' : null,
      // linkedinUsername: linkedinLinked ? user.linkedinUsername || 'linkedinUser' : null,
      avatar,
    };

    // if (updateUser) updateUser(updatedUser);

    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  

  // Avatar picker
  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Link/unlink GitHub
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

  // Link/unlink LinkedIn
  // const handleLinkLinkedin = () => {
  //   if (linkedinLinked) {
  //     Alert.alert('Unlink LinkedIn?', '', [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Unlink', style: 'destructive', onPress: () => setLinkedinLinked(false) },
  //     ]);
  //   } else {
  //     Alert.alert('LinkedIn linked!');
  //     setLinkedinLinked(true);
  //   }
  // };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraButton} onPress={handleAvatarChange}>
            <Camera size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
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
          />
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

          {/* LinkedIn
          <TouchableOpacity
            style={[styles.linkButton, linkedinLinked && styles.linkButtonConnected]}
            onPress={handleLinkLinkedin}
          >
            <View style={styles.linkButtonLeft}>
              <View
                style={[
                  styles.linkIconContainer,
                  { backgroundColor: linkedinLinked ? '#0A66C2' : Colors.backgroundSecondary },
                ]}
              >
                <Linkedin size={24} color={linkedinLinked ? Colors.white : Colors.text} />
              </View>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>LinkedIn</Text>
                <Text style={styles.linkDescription}>
                  {linkedinLinked ? 'Connected' : 'Connect your LinkedIn account'}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.linkButtonText, linkedinLinked && styles.linkButtonTextConnected]}
            >
              {linkedinLinked ? 'Unlink' : 'Link'}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  saveButton: { fontSize: 16, fontWeight: '600', color: Colors.primary, marginRight: 16 },
  content: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.white, marginBottom: 16 },
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
  },
  section: { backgroundColor: Colors.white, padding: 16, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { fontSize: 15, color: Colors.text, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.background },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.background, gap: 10 },
  inputWithIcon: { flex: 1, fontSize: 15, color: Colors.text },
  divider: { height: 8, backgroundColor: Colors.backgroundSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 12, backgroundColor: Colors.background },
  linkButtonConnected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  linkButtonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  linkIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkInfo: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  linkDescription: { fontSize: 13, color: Colors.textSecondary },
  linkButtonText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  linkButtonTextConnected: { color: Colors.error },
});