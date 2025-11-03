import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, X, Check, Users, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { chats, users } from '@/mocks/data';

export default function EditGroupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const chat = chats.find(c => c.id === id);
  const isGroupChat = chat?.isGroup;

  const [groupName, setGroupName] = useState(chat?.groupName || '');
  const [groupMembers, setGroupMembers] = useState(chat?.participants || []);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  if (!chat || !isGroupChat) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const availableUsers = users.filter(user =>
    !groupMembers.some(member => member.id === user.id)
  );

  const addMember = (user: any) => {
    setGroupMembers(prev => [...prev, user]);
  };

  const removeMember = (userId: string) => {
    if (groupMembers.length <= 2) {
      Alert.alert('Error', 'Group must have at least 2 members');
      return;
    }
    setGroupMembers(prev => prev.filter(member => member.id !== userId));
  };

  const saveGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (groupMembers.length < 2) {
      Alert.alert('Error', 'Group must have at least 2 members');
      return;
    }

    // Update the chat in the array
    const chatIndex = chats.findIndex(c => c.id === id);
    if (chatIndex !== -1) {
      chats[chatIndex] = {
        ...chats[chatIndex],
        groupName: groupName.trim(),
        participants: groupMembers,
      };
    }

    Alert.alert('Success', 'Group updated successfully');
    router.back();
  };

  const deleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const chatIndex = chats.findIndex(c => c.id === id);
            if (chatIndex !== -1) {
              chats.splice(chatIndex, 1);
            }
            router.replace('/chats');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Group</Text>
        <TouchableOpacity onPress={saveGroup} style={styles.saveButton}>
          <Check size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.nameInput}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor={Colors.textSecondary}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.membersHeader}>
            <Text style={styles.sectionTitle}>Members ({groupMembers.length})</Text>
            <TouchableOpacity
              onPress={() => setShowMemberSelector(!showMemberSelector)}
              style={styles.addButton}
            >
              <Users size={20} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {groupMembers.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeMember(member.id)}
                style={styles.removeButton}
              >
                <X size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ))}

          {showMemberSelector && availableUsers.length > 0 && (
            <View style={styles.addMembersSection}>
              <Text style={styles.addMembersTitle}>Add Members</Text>
              {availableUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.addMemberItem}
                  onPress={() => addMember(user)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.addMemberAvatar} />
                  <View style={styles.addMemberInfo}>
                    <Text style={styles.addMemberName}>{user.name}</Text>
                    <Text style={styles.addMemberEmail}>{user.email}</Text>
                  </View>
                  <Check size={20} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={deleteGroup} style={styles.deleteButton}>
            <Trash2 size={20} color={Colors.white} />
            <Text style={styles.deleteButtonText}>Delete Group</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  memberEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  addMembersSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addMembersTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  addMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  addMemberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addMemberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  addMemberEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 50,
  },
});
