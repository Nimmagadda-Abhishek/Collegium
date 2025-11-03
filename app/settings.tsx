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
import { useTheme } from '@/contexts/ThemeContext';
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
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [accountPrivate, setAccountPrivate] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
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
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={[styles.container, isDarkMode && { backgroundColor: Colors.darkBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Account</Text>

          <TouchableOpacity style={styles.item} onPress={() => router.push('/edit-profile')}>
            <User size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Lock size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
            <Trash2 size={20} color={Colors.error} />
            <Text style={[styles.itemText, { color: Colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Notifications</Text>
          <View style={styles.item}>
            <Bell size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.item}>
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Show Notifications</Text>
            <TouchableOpacity
              style={[styles.pickerContainer, isDarkMode && { backgroundColor: Colors.darkBackground }]}
              onPress={() => {
                Alert.alert(
                  'Notification Filter',
                  'Select notification type to show',
                  [
                    { text: 'All Notifications', onPress: () => setNotificationFilter('all') },
                    { text: 'Projects Only', onPress: () => setNotificationFilter('projects') },
                    { text: 'Events Only', onPress: () => setNotificationFilter('events') },
                    { text: 'Messages Only', onPress: () => setNotificationFilter('messages') },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Text style={[styles.pickerText, isDarkMode && { color: Colors.darkText }]}>
                {notificationFilter === 'all' ? 'All Notifications' :
                 notificationFilter === 'projects' ? 'Projects Only' :
                 notificationFilter === 'events' ? 'Events Only' :
                 'Messages Only'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Theme</Text>
          <View style={styles.item}>
            {isDarkMode ? <Moon size={20} color={Colors.darkText} /> : <Sun size={20} color={Colors.text} />}
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Privacy</Text>
          <View style={styles.item}>
            <Shield size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Private Account</Text>
            <Switch
              value={accountPrivate}
              onValueChange={togglePrivacy}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Linked Accounts Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Linked Accounts</Text>

          <TouchableOpacity style={styles.item} onPress={handleLinkGithub}>
            <Github size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>
              GitHub {user?.githubUsername ? '(Connected)' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLinkLinkedin}>
            <Linkedin size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>
              LinkedIn {user?.linkedinUsername ? '(Connected)' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Blocked Accounts Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>Privacy</Text>
          <TouchableOpacity style={styles.item} onPress={() => router.push('/blocked-accounts' as any)}>
            <Shield size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>Blocked Accounts</Text>
            <Text style={[styles.itemText, { color: Colors.textSecondary }]}>
              {user?.blockedUsers?.length || 0} blocked
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: Colors.darkText }]}>About</Text>
          <TouchableOpacity style={styles.item}>
            <Info size={20} color={isDarkMode ? Colors.darkText : Colors.text} />
            <Text style={[styles.itemText, isDarkMode && { color: Colors.darkText }]}>About App</Text>
            <Text style={[styles.itemText, { color: Colors.textSecondary }]}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.section, isDarkMode && { backgroundColor: Colors.darkSurface }]}>
          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <Text style={[styles.itemText, { color: Colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  pickerContainer: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
});
