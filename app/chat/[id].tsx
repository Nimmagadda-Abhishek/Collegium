import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Paperclip, Smile, ArrowLeft } from 'lucide-react-native';
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

  const chat = chats.find(c => c.id === id);
  const otherUser = chat?.participants.find(p => p.id !== user?.id);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: otherUser?.id || '2',
      content: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      senderId: user?.id || '1',
      content: "I'm good! Working on the campus navigation project.",
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: '3',
      senderId: otherUser?.id || '2',
      content: 'That sounds exciting! Need any help with the design?',
      timestamp: '10:33 AM',
      isOwn: false,
    },
    {
      id: '4',
      senderId: user?.id || '1',
      content: 'Actually yes! Could you review the UI mockups I sent?',
      timestamp: '10:35 AM',
      isOwn: true,
    },
    {
      id: '5',
      senderId: otherUser?.id || '2',
      content: 'Sure! I\'ll take a look and get back to you soon.',
      timestamp: '10:36 AM',
      isOwn: false,
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        content: message,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Image source={{ uri: otherUser?.avatar }} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerName}>{otherUser?.name}</Text>
                <Text style={styles.headerStatus}>Active now</Text>
              </View>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper,
            ]}
          >
            {!msg.isOwn && (
              <Image
                source={{ uri: otherUser?.avatar }}
                style={styles.messageAvatar}
              />
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
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Smile size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            message.trim() && styles.sendButtonActive,
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Send
            size={20}
            color={message.trim() ? Colors.white : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 16,
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
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
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
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
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
});
