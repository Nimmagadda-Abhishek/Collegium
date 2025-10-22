import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Paperclip, Smile, ArrowLeft, MoreVertical, Trash2, Bell, BellOff, Archive } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { chats } from '@/mocks/data';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [inputHeight, setInputHeight] = useState(40);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const chat = chats.find(c => c.id === id);
  const otherUser = chat?.participants.find(p => p.id !== user?.id);

  const [message, setMessage] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: otherUser?.id || '2',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isOwn: false,
    },
    {
      id: '2',
      senderId: user?.id || '1',
      content: "I'm good! Working on the campus navigation project.",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      isOwn: true,
    },
    {
      id: '3',
      senderId: otherUser?.id || '2',
      content: 'That sounds exciting! Need any help with the design?',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      isOwn: false,
    },
    {
      id: '4',
      senderId: user?.id || '1',
      content: 'Actually yes! Could you review the UI mockups I sent?',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      isOwn: true,
    },
    {
      id: '5',
      senderId: otherUser?.id || '2',
      content: "Sure! I'll take a look and get back to you soon.",
      timestamp: new Date(Date.now() - 3200000).toISOString(),
      isOwn: false,
    },
  ]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setInputHeight(40);
      Keyboard.dismiss();
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setOptionsVisible(false);
            Alert.alert('Success', 'Chat cleared successfully');
          },
        },
      ]
    );
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setOptionsVisible(false);
            router.back();
            Alert.alert('Success', 'Chat deleted successfully');
          },
        },
      ]
    );
  };

  const handleMuteNotifications = () => {
    setIsMuted(!isMuted);
    setOptionsVisible(false);
    Alert.alert(
      isMuted ? 'Notifications Enabled' : 'Notifications Muted',
      isMuted 
        ? 'You will receive notifications from this chat' 
        : 'You will not receive notifications from this chat'
    );
  };

  const handleArchiveChat = () => {
    Alert.alert(
      'Archive Chat',
      'This chat will be moved to archived chats.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            setOptionsVisible(false);
            router.back();
            Alert.alert('Success', 'Chat archived successfully');
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item: msg, index }: { item: Message; index: number }) => {
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showAvatar = !msg.isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId);
    const showTimestamp = !prevMsg || 
      new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000;

    return (
      <View style={styles.messageContainer}>
        {showTimestamp && (
          <Text style={styles.timestampText}>
            {formatTime(msg.timestamp)}
          </Text>
        )}
        <View
          style={[
            styles.messageWrapper,
            msg.isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper,
          ]}
        >
          {!msg.isOwn && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <Image
                  source={{ uri: otherUser?.avatar }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={styles.avatarSpacer} />
              )}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              msg.isOwn ? styles.ownMessage : styles.otherMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.isOwn ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!chat || !otherUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Chat not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Image 
                source={{ uri: otherUser.avatar }} 
                style={styles.headerAvatar}
              />
              <View>
                <Text style={styles.headerName}>{otherUser.name}</Text>
                <Text style={styles.headerStatus}>Active now</Text>
              </View>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={() => setOptionsVisible(true)}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity 
          style={styles.attachButton}
          activeOpacity={0.7}
        >
          <Paperclip size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.inputWrapper, { minHeight: Math.min(inputHeight, 100) }]}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={1000}
            onContentSizeChange={(e) => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
          <TouchableOpacity 
            style={styles.emojiButton}
            activeOpacity={0.7}
          >
            <Smile size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
            activeOpacity={0.8}
          >
            <Send
              size={20}
              color={message.trim() ? Colors.white : Colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Options Modal */}
      <Modal
        visible={optionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsVisible(false)}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleMuteNotifications}
            >
              {isMuted ? (
                <Bell size={22} color={Colors.text} />
              ) : (
                <BellOff size={22} color={Colors.text} />
              )}
              <Text style={styles.optionText}>
                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleArchiveChat}
            >
              <Archive size={22} color={Colors.text} />
              <Text style={styles.optionText}>Archive Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleClearChat}
            >
              <Trash2 size={22} color={Colors.accent} />
              <Text style={[styles.optionText, { color: Colors.accent }]}>
                Clear Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionItem, styles.optionItemLast]}
              onPress={handleDeleteChat}
            >
              <Trash2 size={22} color={Colors.accent} />
              <Text style={[styles.optionText, { color: Colors.accent }]}>
                Delete Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setOptionsVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.primary,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 4,
  },
  timestampText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  ownMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ownMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  attachButton: {
    padding: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 80,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
    marginBottom: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});