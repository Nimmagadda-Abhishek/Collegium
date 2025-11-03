import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { currentUser, users } from '@/mocks/data';
import { User } from '@/types';
import { ArrowLeft, Trash2, UserX } from 'lucide-react-native';

export default function BlockedAccountsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Get blocked users
  const blockedUsers = currentUser.blockedUsers?.map(userId =>
    users.find(u => u.id === userId)
  ).filter(Boolean) as User[] || [];

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUnblockUser = (userId: string) => {
    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: () => {
            if (currentUser.blockedUsers) {
              currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== userId);
            }
            Alert.alert('Success', 'User unblocked');
          },
        },
      ]
    );
  };

  const handleDeleteFromBlocked = (userId: string) => {
    Alert.alert(
      'Remove from Blocked',
      'This will remove the user from your blocked list. They may still be able to send you messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (currentUser.blockedUsers) {
              currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== userId);
            }
            Alert.alert('Success', 'User removed from blocked list');
          },
        },
      ]
    );
  };

  const handleBulkUnblock = () => {
    Alert.alert(
      'Unblock Users',
      `Are you sure you want to unblock ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: () => {
            if (currentUser.blockedUsers) {
              currentUser.blockedUsers = currentUser.blockedUsers.filter(id => !selectedUsers.includes(id));
            }
            setSelectedUsers([]);
            setMultiSelectMode(false);
            Alert.alert('Success', 'Users unblocked');
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Remove from Blocked',
      `Remove ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} from blocked list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (currentUser.blockedUsers) {
              currentUser.blockedUsers = currentUser.blockedUsers.filter(id => !selectedUsers.includes(id));
            }
            setSelectedUsers([]);
            setMultiSelectMode(false);
            Alert.alert('Success', 'Users removed from blocked list');
          },
        },
      ]
    );
  };

  const renderBlockedUser = (user: User) => {
    const isSelected = selectedUsers.includes(user.id);

    return (
      <View key={user.id} style={styles.userItemContainer}>
        <TouchableOpacity
          style={[
            styles.userItem,
            multiSelectMode && isSelected && styles.userItemSelected,
          ]}
          onPress={() => {
            if (multiSelectMode) toggleUserSelection(user.id);
          }}
          onLongPress={() => {
            setMultiSelectMode(true);
            setSelectedUsers([user.id]);
          }}
          activeOpacity={0.7}
          disabled={!multiSelectMode}
        >
          <View style={styles.userInfo}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>
            </View>
          </View>

          {!multiSelectMode && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUnblockUser(user.id)}
                activeOpacity={0.7}
              >
                <UserX size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteFromBlocked(user.id)}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}

          {multiSelectMode && (
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blocked Accounts</Text>
          <View style={styles.headerButton} />
        </View>
      </View>

      {/* Multi-select actions */}
      {multiSelectMode && (
        <View style={styles.actionBar}>
          <Text style={styles.actionBarText}>
            {selectedUsers.length} selected
          </Text>
          <View style={styles.actionBarButtons}>
            <TouchableOpacity
              onPress={handleBulkUnblock}
              style={styles.bulkActionButton}
              activeOpacity={0.7}
            >
              <UserX size={20} color={Colors.white} />
              <Text style={styles.bulkActionText}>Unblock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={[styles.bulkActionButton, styles.bulkActionButtonDelete]}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={Colors.white} />
              <Text style={styles.bulkActionText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMultiSelectMode(false);
                setSelectedUsers([]);
              }}
              style={[styles.bulkActionButton, styles.bulkActionButtonSecondary]}
              activeOpacity={0.7}
            >
              <Text style={[styles.bulkActionText, styles.bulkActionTextSecondary]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {blockedUsers.length > 0 ? (
          blockedUsers.map(renderBlockedUser)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked accounts</Text>
            <Text style={styles.emptySubtext}>
              Accounts you block will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
  },
  actionBarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionBarButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  bulkActionButtonDelete: {
    backgroundColor: Colors.error,
  },
  bulkActionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  bulkActionText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  bulkActionTextSecondary: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItemContainer: {
    marginBottom: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  userItemSelected: {
    backgroundColor: Colors.backgroundSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
