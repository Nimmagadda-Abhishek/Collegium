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
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

import { Search, Plus, Trash2, X, Check, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { chats, currentUser } from '@/mocks/data';
import { Chat, User } from '@/types';

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('All');
  const [customSelected, setCustomSelected] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'custom' | 'group'>('custom');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
        filtered = filtered.filter(chat => chat.requestStatus !== 'pending');
        break;
      case 'All':
        // Exclude pending requests from All tab
        filtered = filtered.filter(chat => chat.requestStatus !== 'pending');
        break;
      case 'Unread':
        filtered = filtered.filter(chat => chat.unreadCount > 0 && chat.requestStatus !== 'pending');
        break;
      case 'Groups':
        filtered = filtered.filter(chat => chat.isGroup && chat.requestStatus !== 'pending');
        break;
      case 'Requests':
        filtered = filtered.filter(chat => chat.requestStatus === 'pending');
        break;
      case 'Custom':
        filtered = filtered.filter(chat =>
          chat.participants.some(p => customSelected.includes(p.id)) && chat.requestStatus !== 'pending'
        );
        break;
    }
    // Apply search
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(chat => {
        const name = chat.isGroup ? chat.groupName : chat.participants[1]?.name;
        return (
          name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    return filtered;
  };

  // Toggle contact selection for custom tab
  const toggleContact = (contactId: string) => {
    if (modalMode === 'custom') {
      setCustomSelected(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    } else {
      setSelectedMembers(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    }
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
      `Are you sure you want to delete ${selectedChats.length} chat${selectedChats.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSelectedChats([]);
            setMultiSelectMode(false);
            Alert.alert('Success', 'Selected chats have been deleted.');
          },
        },
      ]
    );
  };

  // Create new group chat
  const createGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members');
      return;
    }

    const groupMembers = selectedMembers.map(id => allContacts.find(c => c.id === id)!);
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

    // Reset modal state
    setModalVisible(false);
    setModalMode('custom');
    setGroupName('');
    setSelectedMembers([]);

    // Navigate to the new group chat
    router.push(`/chat/${newGroupChat.id}`);
  };

  // Handle accept/block for requests
  const handleAcceptRequest = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.requestStatus = 'accepted';
      Alert.alert('Success', 'Message request accepted');
    }
  };

  const handleBlockRequest = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.requestStatus = 'blocked';
      const otherUser = chat.participants.find(p => p.id !== currentUser.id);
      if (otherUser && currentUser.blockedUsers) {
        currentUser.blockedUsers.push(otherUser.id);
      }
      Alert.alert('Success', 'User blocked');
    }
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
    const isRequest = chat.requestStatus === 'pending';

    return (
      <View key={chat.id} style={styles.chatItemContainer}>
        <TouchableOpacity
          style={[
            styles.chatItem,
            multiSelectMode && isSelected && styles.chatItemSelected,
          ]}
          onPress={() => {
            if (multiSelectMode) toggleChatSelection(chat.id);
            else if (!isRequest) router.push(`/chat/${chat.id}`);
          }}
          onLongPress={() => !isRequest && handleLongPress(chat.id)}
          activeOpacity={0.7}
          disabled={isRequest}
        >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          {multiSelectMode && (
            <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
              {isSelected && <Check size={16} color={Colors.white} />}
            </View>
          )}
          {!multiSelectMode && chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {displayName}
            </Text>
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

      {isRequest && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(chat.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestButton, styles.blockButton]}
            onPress={() => handleBlockRequest(chat.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.blockButtonText}>Block</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Custom colored header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chats</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/create-group')}
              activeOpacity={0.7}
            >
              <Plus size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {['All', 'Active', 'Unread', 'Groups', 'Requests'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
                {tab === 'Unread' && chats.filter(c => c.unreadCount > 0).length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {chats.filter(c => c.unreadCount > 0).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action bar for multi-select */}
        {multiSelectMode && (
          <View style={styles.actionBar}>
            <Text style={styles.actionBarText}>
              {selectedChats.length} selected
            </Text>
            <View style={styles.actionBarButtons}>
              <TouchableOpacity 
                onPress={deleteSelectedChats} 
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={Colors.white} />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setMultiSelectMode(false);
                  setSelectedChats([]);
                }} 
                style={[styles.actionButton, styles.actionButtonSecondary]}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, styles.actionTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chat List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatList}
        >
          {filterChats().length > 0 ? (
            filterChats().map(chat => renderChat(chat))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'Requests' ? 'No message requests' : 'No chats found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search term'
                  : activeTab === 'Requests'
                    ? 'Message requests from new contacts will appear here'
                    : 'Start a new conversation'
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modal for selecting contacts for Custom Tab or Creating Group */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => {
            setModalVisible(false);
            setModalMode('custom');
            setGroupName('');
            setSelectedMembers([]);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'custom' ? 'Select Contacts' : 'Create Group'}
              </Text>
              <View style={styles.modalHeaderButtons}>
                {modalMode === 'custom' ? (
                  <TouchableOpacity
                    onPress={() => {
                      setModalMode('group');
                      setSelectedMembers(customSelected);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCreateGroup}>Create Group</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={createGroup}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalDone}>Create</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setModalMode('custom');
                    setGroupName('');
                    setSelectedMembers([]);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>

            {modalMode === 'group' && (
              <View style={styles.groupNameContainer}>
                <TextInput
                  style={styles.groupNameInput}
                  placeholder="Enter group name"
                  placeholderTextColor={Colors.textSecondary}
                  value={groupName}
                  onChangeText={setGroupName}
                  maxLength={50}
                />
              </View>
            )}
            
            {(modalMode === 'custom' ? customSelected.length > 0 : selectedMembers.length > 0) && (
              <View style={styles.selectedContactsBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(modalMode === 'custom' ? customSelected : selectedMembers).map(contactId => {
                    const contact = allContacts.find(c => c.id === contactId);
                    return (
                      <View key={contactId} style={styles.selectedContactChip}>
                        <Text style={styles.selectedContactName} numberOfLines={1}>
                          {contact?.name}
                        </Text>
                        <TouchableOpacity onPress={() => toggleContact(contactId)}>
                          <X size={16} color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <FlatList
              data={allContacts}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = customSelected.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.contactItem,
                      isSelected && styles.contactItemSelected,
                    ]}
                    onPress={() => toggleContact(item.id)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                    <Text style={styles.contactName}>{item.name}</Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Check size={16} color={Colors.white} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background ,
    
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 20,
    
    marginVertical:20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: Colors.text 
  },
  clearButton: {
    padding: 4,
  },
  tabsScrollView: {
    maxHeight: 50,
    marginBottom: 12,
  },
  // tabsContainer is updated below
  activeTabButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  
    // ✨ For desktop hover-like sharp edges
    transform: [{ scale: 1 }],
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  
    // 🖥️ Smaller font on larger screens
    ...(Platform.OS === 'web' && { fontSize: 13 }),
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  chatItemSelected: {
    backgroundColor: Colors.backgroundSecondary,
  },
  chatItemContainer: {
    
    marginHorizontal: 15,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  requestButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  blockButton: {
    backgroundColor: Colors.accent,
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  blockButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  avatarContainer: { 
    position: 'relative', 
    marginRight: 12 
  },
  avatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28 
  },
  selectCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleActive: {
    backgroundColor: Colors.primary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unreadText: { 
    color: Colors.white, 
    fontSize: 11, 
    fontWeight: '700' 
  },
  chatContent: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: { 
    flex: 1,
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.text,
    marginRight: 8,
  },
  chatTime: { 
    fontSize: 13, 
    color: Colors.textSecondary 
  },
  lastMessage: { 
    fontSize: 14, 
    color: Colors.textSecondary 
  },
  lastMessageUnread: { 
    fontWeight: '600', 
    color: Colors.text 
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
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  actionText: { 
    color: Colors.white, 
    fontWeight: '600', 
    fontSize: 14 
  },
  actionTextSecondary: {
    color: Colors.white,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalDone: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedContactsBar: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  selectedContactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  selectedContactName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 100,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  contactItemSelected: {
    backgroundColor: Colors.backgroundSecondary,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactName: { 
    flex: 1,
    fontSize: 16, 
    color: Colors.text,
    fontWeight: '500',
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
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalCreateGroup: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  groupNameContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  tabsWrapper: {
    width: '100%',
    paddingVertical: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    gap: 10,
  },
  tabButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    gap: 6,
  },
});

  