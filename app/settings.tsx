import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Lock,
  User,
  Info,
  LogOut,
  Moon,
  Sun,
  Shield,
  Github,
  Linkedin,
  Trash2,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [accountPrivate, setAccountPrivate] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleTheme = () => setDarkTheme(!darkTheme);
  const togglePrivacy = () => setAccountPrivate(!accountPrivate);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement delete logic here
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleLinkGithub = async () => {
    Alert.alert('GitHub Account', user?.githubUsername ? 'Unlink GitHub?' : 'Link GitHub?');
    // Add link/unlink logic
  };

  const handleLinkLinkedin = async () => {
    Alert.alert('LinkedIn Account', user?.linkedinUsername ? 'Unlink LinkedIn?' : 'Link LinkedIn?');
    // Add link/unlink logic
  };

  return (
    <View style={[styles.container, darkTheme && { backgroundColor: '#121212' }]}>
      {/* <Stack.Screen options={{ title: 'Settings' }} /> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>Account</Text>

          <TouchableOpacity style={styles.item} onPress={() => router.push('/edit-profile')}>
            <User size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Lock size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
            <Trash2 size={20} color={Colors.error} />
            <Text style={[styles.itemText, { color: Colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>Notifications</Text>
          <View style={styles.item}>
            <Bell size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>Theme</Text>
          <View style={styles.item}>
            {darkTheme ? <Moon size={20} color="#fff" /> : <Sun size={20} color={Colors.text} />}
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>Dark Mode</Text>
            <Switch
              value={darkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>Privacy</Text>
          <View style={styles.item}>
            <Shield size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>Private Account</Text>
            <Switch
              value={accountPrivate}
              onValueChange={togglePrivacy}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Linked Accounts Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>Linked Accounts</Text>

          <TouchableOpacity style={styles.item} onPress={handleLinkGithub}>
            <Github size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>
              GitHub {user?.githubUsername ? '(Connected)' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLinkLinkedin}>
            <Linkedin size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>
              LinkedIn {user?.linkedinUsername ? '(Connected)' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <Text style={[styles.sectionTitle, darkTheme && { color: '#fff' }]}>About</Text>
          <TouchableOpacity style={styles.item}>
            <Info size={20} color={darkTheme ? '#fff' : Colors.text} />
            <Text style={[styles.itemText, darkTheme && { color: '#fff' }]}>About App</Text>
            <Text style={[styles.itemText, { color: Colors.textSecondary }]}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.section, darkTheme && { backgroundColor: '#1e1e1e' }]}>
          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <Text style={[styles.itemText, { color: Colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background},
  content: { flex: 1 },
  section: {
    backgroundColor: Colors.white,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
});