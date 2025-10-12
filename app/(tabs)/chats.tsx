import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { chats } from '@/mocks/data';
import { Chat } from '@/types';

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const renderChat = (chat: Chat) => {
    const displayName = chat.isGroup
      ? chat.groupName
      : chat.participants[1].name;
    const displayAvatar = chat.isGroup
      ? chat.groupAvatar
      : chat.participants[1].avatar;
    
    return (
      <TouchableOpacity
        key={chat.id}
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${chat.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          {chat.unreadCount > 0 && (
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
              chat.unreadCount > 0 && styles.lastMessageUnread,
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
      <View style={[styles.searchContainer, { marginTop: insets.top + 16 }]}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search messages...</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {chats.map(renderChat)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
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
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chatTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lastMessageUnread: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
