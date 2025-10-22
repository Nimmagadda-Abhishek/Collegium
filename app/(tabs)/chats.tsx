import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Plus, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { chats } from '@/mocks/data';
import { Chat, User } from '@/types';


export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('All');
  const [customSelected, setCustomSelected] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  // Extract all contacts from chats for custom tab
  const allContacts: User[] = [];
  chats.forEach(chat => {
    chat.participants.forEach(p => {
      if (!allContacts.find(c => c.id === p.id)) allContacts.push(p);
    });
  });

  // Filter chats based on active tab and search
  const filterChats = () => {
    let filtered = chats;
    switch (activeTab) {
      case 'Active':
        filtered = filtered.filter(chat => chat.isActive);
        break;
      case 'Unread':
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case 'Groups':
        filtered = filtered.filter(chat => chat.isGroup);
        break;
      case 'Custom':
        filtered = filtered.filter(chat =>
          chat.participants.some(p => customSelected.includes(p.id))
        );
        break;
    }
    // Apply search
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(chat => {
        const name = chat.isGroup ? chat.groupName : chat.participants[1].name;
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    return filtered;
  };

  // Toggle contact selection for custom tab
  const toggleContact = (contactId: string) => {
    setCustomSelected(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Toggle chat selection in multi-select mode
  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  // Enable multi-select mode on long press
  const handleLongPress = (chatId: string) => {
    setMultiSelectMode(true);
    setSelectedChats([chatId]);
  };

  // Delete selected chats
  const deleteSelectedChats = () => {
    Alert.alert(
      'Delete Chats',
      'Are you sure you want to delete the selected chats?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement actual deletion logic here
            setSelectedChats([]);
            setMultiSelectMode(false);
            Alert.alert('Deleted', 'Selected chats have been deleted.');
          },
        },
      ]
    );
  };

  // Render chat item
  const renderChat = (chat: Chat) => {
    const displayName = chat.isGroup
      ? chat.groupName
      : chat.participants[1].name;
    const displayAvatar = chat.isGroup
      ? chat.groupAvatar
      : chat.participants[1].avatar;

    const isSelected = selectedChats.includes(chat.id);

    return (
      <TouchableOpacity
        key={chat.id}
        style={[
          styles.chatItem,
          multiSelectMode && isSelected && { backgroundColor: Colors.backgroundSecondary },
        ]}
        onPress={() => {
          if (multiSelectMode) toggleChatSelection(chat.id);
          else router.push(`/chat/${chat.id}`);
        }}
        onLongPress={() => handleLongPress(chat.id)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          {chat.unreadCount > 0 && !isSelected && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{displayName}</Text>
            <Text style={styles.chatTime}>
              {new Date(chat.lastMessageTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text
            style={[
              styles.lastMessage,
              chat.unreadCount > 0 && !isSelected && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { marginTop: insets.top + 16 }]}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search messages..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {activeTab === 'Custom' && (
          <TouchableOpacity style={styles.newChatButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Active', 'Unread', 'Groups', 'Custom'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action bar for multi-select */}
      {multiSelectMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={deleteSelectedChats} style={styles.actionButton}>
            <Trash2 size={20} color={Colors.white} />
            <Text style={styles.actionText}>Delete ({selectedChats.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setMultiSelectMode(false);
            setSelectedChats([]);
          }} style={styles.actionButton}>
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filterChats().map(renderChat)}
      </ScrollView>

      {/* Modal for selecting contacts for Custom Tab */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text }}>Select Contacts</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 16, color: Colors.primary }}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={allContacts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => toggleContact(item.id)}
              >
                <Text style={styles.contactName}>{item.name}</Text>
                {customSelected.includes(item.id) && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 24, color: Colors.text },
  newChatButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabText: { fontSize: 14, color: Colors.textSecondary },
  activeTabText: { color: Colors.white, fontWeight: '600' },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  chatContent: { flex: 1, justifyContent: 'center' },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  chatTime: { fontSize: 13, color: Colors.textSecondary },
  lastMessage: { fontSize: 14, color: Colors.textSecondary },
  lastMessageUnread: { fontWeight: '600', color: Colors.text },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactName: { fontSize: 16, color: Colors.text },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
});