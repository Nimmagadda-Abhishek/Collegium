import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, X, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { users, chats } from '@/mocks/data';
import { Chat } from '@/types';

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members');
      return;
    }

    // Create the group chat
    const groupMembers = selectedUsers.map(id => users.find(u => u.id === id)!);
    const newGroupChat: Chat = {
      id: Date.now().toString(),
      participants: groupMembers,
      lastMessage: 'Group created',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isGroup: true,
      groupName: groupName.trim(),
      groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', // Default group avatar
    };

    // Add to chats array (in real app, this would be an API call)
    chats.unshift(newGroupChat); // Add to beginning of array

    // Navigate to the new group chat
    router.push(`/chat/${newGroupChat.id}`);
  };

  const renderUser = ({ item: user }: { item: typeof users[0] }) => {
    const isSelected = selectedUsers.includes(user.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUserSelection(user.id)}
      >
        <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Check size={16} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item: userId }: { item: string }) => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    return (
      <View style={styles.selectedUserChip}>
        <Image source={{ uri: user.avatar }} style={styles.selectedUserAvatar} />
        <Text style={styles.selectedUserName}>{user.name}</Text>
        <TouchableOpacity
          onPress={() => removeSelectedUser(userId)}
          style={styles.removeButton}
        >
          <X size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length < 2}
          style={[
            styles.createButton,
            (!groupName.trim() || selectedUsers.length < 2) && styles.createButtonDisabled,
          ]}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.usersList}
        ListHeaderComponent={
          <>
            <View style={styles.groupNameSection}>
              <Text style={styles.sectionTitle}>Group Name</Text>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Enter group name"
                placeholderTextColor={Colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
              />
            </View>

            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>
                Add Members ({selectedUsers.length})
              </Text>

              {selectedUsers.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={selectedUsers}
                  renderItem={renderSelectedUser}
                  keyExtractor={(item) => item}
                  contentContainerStyle={styles.selectedUsersList}
                />
              )}

              <View style={styles.searchContainer}>
                <Search size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search friends"
                  placeholderTextColor={Colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
          </>
        }
      />
    </View>
    </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  createButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  groupNameSection: {
    paddingVertical: 10,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  membersSection: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  selectedUsersList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  selectedUserName: {
    fontSize: 14,
    color: Colors.white,
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  usersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
