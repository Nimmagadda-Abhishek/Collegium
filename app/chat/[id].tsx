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
  Easing,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Paperclip, Smile, ArrowLeft, MoreVertical, Trash2, Bell, BellOff, Archive, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { chats } from '@/mocks/data';

interface LocalMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type?: 'text' | 'image';
  imageUri?: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList<LocalMessage>>(null);

  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const chat = chats.find(c => c.id === id);

  // Check if this is a pending request
  const isPendingRequest = chat?.requestStatus === 'pending';
  const isGroupChat = chat?.isGroup;
  const otherUser = !isGroupChat ? chat?.participants.find(p => p.id !== user?.id) : null;
  const groupMembers = isGroupChat ? chat?.participants : [];
  const recentActiveMembers = groupMembers.slice(0, 3); // Show first 3 members as recent active

  const [message, setMessage] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(40);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>(
    chat?.messages?.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      content: msg.content,
      timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
      isOwn: msg.senderId === user?.id,
    })) || (isGroupChat ? [] : [
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
    ])
  );

  // Animated intro section for empty chat
  const introAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (messages.length === 0) {
      Animated.timing(introAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(introAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [messages.length, introAnim]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

      const newMessage: LocalMessage = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isOwn: true,
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setInputHeight(40);
      Keyboard.dismiss();
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Add multiple images as separate messages
      const newMessages: LocalMessage[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        senderId: user?.id || '1',
        content: 'Image',
        timestamp: new Date().toISOString(),
        isOwn: true,
        type: 'image',
        imageUri: asset.uri,
      }));

      setMessages(prev => [...prev, ...newMessages]);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setEmojiPickerVisible(false);
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
    const title = isGroupChat ? 'Delete Group' : 'Delete Chat';
    const message = isGroupChat
      ? 'Are you sure you want to delete this group? This action cannot be undone.'
      : 'Are you sure you want to delete this chat? This action cannot be undone.';
    const successMessage = isGroupChat ? 'Group deleted successfully' : 'Chat deleted successfully';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setOptionsVisible(false);
            router.back();
            Alert.alert('Success', successMessage);
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setOptionsVisible(false);
            router.back();
            Alert.alert('Success', 'You have left the group');
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

  const renderMessage = ({ item: msg, index }: { item: LocalMessage; index: number }) => {
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
                  source={{
                    uri: isGroupChat
                      ? groupMembers.find(m => m.id === msg.senderId)?.avatar || otherUser?.avatar
                      : otherUser?.avatar
                  }}
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
            {!msg.isOwn && isGroupChat && showAvatar && (
              <Text style={styles.senderName}>
                {groupMembers.find(m => m.id === msg.senderId)?.name || 'Unknown'}
              </Text>
            )}
            {msg.type === 'image' && msg.imageUri ? (
              <Image
                source={{ uri: msg.imageUri }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={[
                  styles.messageText,
                  msg.isOwn ? styles.ownMessageText : styles.otherMessageText,
                ]}
              >
                {msg.content}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!chat || (!isGroupChat && !otherUser)) {
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
      behavior={'padding'}
      keyboardVerticalOffset={0}
      enabled
    >
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.customHeader, { paddingTop: insets.top + 16 }]}>
          <View style={styles.customHeaderContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.customHeaderInfo}
              activeOpacity={0.8}
              onPress={() => setProfileVisible(true)}
            >
              {isGroupChat ? (
                <>
                  <Text style={styles.customHeaderTitle}>{chat.groupName}</Text>
                  <Text style={styles.customHeaderSubtitle}>
                    {groupMembers.length} members • {recentActiveMembers.length} active
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.customHeaderTitle}>{otherUser?.name}</Text>
                  <Text style={styles.customHeaderSubtitle}>Active now</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setOptionsVisible(true)} 
              style={styles.headerButton}
            >
              <MoreVertical size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </>

      {/* Animated Intro Section */}
      {messages.length === 0 && (
        <Animated.View
          style={[
            styles.introContainer,
            {
              opacity: introAnim,
              transform: [
                {
                  translateY: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: isGroupChat ? chat?.groupAvatar || groupMembers[0]?.avatar : otherUser?.avatar }}
            style={styles.introAvatar}
          />
          <Text style={styles.introName}>{isGroupChat ? chat.groupName : otherUser?.name}</Text>
          <Text style={styles.introHandle}>
            {isGroupChat
              ? `${groupMembers.length} members`
              : `@${otherUser?.name || otherUser?.name?.toLowerCase().replace(/\s+/g, '_')}`}
          </Text>
          {isGroupChat ? null : <TouchableOpacity
            style={styles.introButton}
            onPress={() => router.push(`/user/${isGroupChat ? 'group' : otherUser?.id}`)}
          >
            
            <Text style={styles.introButtonText}>View Profile</Text>
          </TouchableOpacity> }

          {/* <View style={styles.introActions}>
          <TouchableOpacity
            style={styles.introIcon}
            onPress={() => setEmojiPickerVisible(true)}
          >
            <Smile size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

            <TouchableOpacity
              style={styles.introIcon}
              onPress={handleImagePick}
            >
              <Image
                source={require('@/assets/icons/image-placeholder.png')}
                style={{ width: 24, height: 24, tintColor: Colors.textSecondary }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.introIcon}
              onPress={() => Alert.alert('Feature coming soon 🎤')}
            >
              <Image
                source={require('@/assets/icons/mic-placeholder.png')}
                style={{ width: 24, height: 24, tintColor: Colors.textSecondary }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.introIcon}
              onPress={() => Alert.alert('Attach file feature coming soon 📎')}
            >
              <Paperclip size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View> */}
        </Animated.View>
      )}

      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.messagesContent,
            {
              paddingBottom: 0 + (isKeyboardVisible ? keyboardHeight : 0),
            },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />
      </View>

      {isPendingRequest ? (
        <View style={[styles.requestContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.requestAcceptButton}
            onPress={() => {
              if (chat) {
                chat.requestStatus = 'accepted';
                Alert.alert('Success', 'Message request accepted');
                router.replace('/chats');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.requestAcceptText}>Accept Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.requestBlockButton}
            onPress={() => {
              if (chat) {
                chat.requestStatus = 'blocked';
                const otherUser = chat.participants.find(p => p.id !== user?.id);
                if (otherUser && user?.blockedUsers) {
                  user.blockedUsers.push(otherUser.id);
                }
                Alert.alert('Success', 'User blocked');
                router.replace('/chats');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.requestBlockText}>{isGroupChat ? 'Block Group' : 'Block'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            onPress={handleImagePick}
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
              onPress={() => setEmojiPickerVisible(true)}
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
      )}

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

            {isGroupChat && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleLeaveGroup}
              >
                <Trash2 size={22} color={Colors.accent} />
                <Text style={[styles.optionText, { color: Colors.accent }]}>
                  Leave Group
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.optionItem, styles.optionItemLast]}
              onPress={handleDeleteChat}
            >
              <Trash2 size={22} color={Colors.accent} />
              <Text style={[styles.optionText, { color: Colors.accent }]}>
                {isGroupChat ? 'Delete Group' : 'Delete Chat'}
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
      {/* Emoji Picker Modal */}
      <Modal
        visible={emojiPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.emojiModalOverlay}
          activeOpacity={1}
          onPress={() => setEmojiPickerVisible(false)}
        >
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Select Emoji</Text>
              <TouchableOpacity
                onPress={() => setEmojiPickerVisible(false)}
                style={styles.emojiCloseButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {[
                '😀', '😂', '🥰', '😍', '🤗', '😉', '😎', '🤔',
                '😮', '😢', '😭', '😤', '😡', '🥺', '😴', '🤤',
                '🤗', '🤭', '🤫', '🤥', '😇', '🥴', '😵', '🤯',
                '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
                '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
                '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
                '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
                '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
                '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
                '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉',
                '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓',
                '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛',
                '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢',
                '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️',
                '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋',
                '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
                '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
                '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
                '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿',
                '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁',
                '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'
              ].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiItem}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileVisible(false)}
      >
        <TouchableOpacity
          style={styles.profileOverlay}
          activeOpacity={1}
          onPress={() => setProfileVisible(false)}
        >
          <View style={styles.profileContainer}>
            {isGroupChat ? (
              <View style={styles.groupProfileContainer}>
                <View style={styles.groupHeader}>
                  <Image
                    source={{
                      uri: chat?.groupAvatar || groupMembers[0]?.avatar,
                    }}
                    style={styles.groupAvatar}
                  />
                  <Text style={styles.groupName}>{chat.groupName}</Text>
                  <Text style={styles.groupStatus}>
                    {groupMembers.length} members • {recentActiveMembers.length} active
                  </Text>
                </View>

                <Text style={styles.membersTitle}>Members</Text>
                <FlatList
                  data={groupMembers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.memberItem}>
                      <Image
                        source={{ uri: item.avatar }}
                        style={styles.memberAvatar}
                      />
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberRole}>
                          {item.id === user?.id ? 'You' : item.major}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewProfileButton}
                        onPress={() => {
                          setProfileVisible(false);
                          router.push(`/user/${item.id}`);
                        }}
                      >
                        <Text style={styles.viewProfileText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.membersList}
                />

                <View style={styles.groupActions}>
                  <TouchableOpacity
                    style={[styles.profileButton, styles.profileButtonOutline]}
                    onPress={() => {
                      setProfileVisible(false);
                      Alert.alert(
                        'Block Group',
                        'Are you sure you want to block this group?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Block',
                            style: 'destructive',
                            onPress: () => {
                              router.back();
                              Alert.alert('Success', 'Group blocked successfully');
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.profileButtonText, { color: Colors.accent }]}>
                      {isGroupChat ? 'Block Group' : 'Block'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileCard}>
                <Image
                  source={{ uri: otherUser?.avatar }}
                  style={styles.profileAvatar}
                />
                <Text style={styles.profileName}>{otherUser?.name}</Text>
                <Text style={styles.profileStatus}>Active now</Text>

                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => {
                      setProfileVisible(false);
                      router.push(`/user/${otherUser?.id}`);
                    }}
                  >
                    <Text style={styles.profileButtonText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.profileButton, styles.profileButtonOutline]}
                    onPress={() => {
                      setProfileVisible(false);
                      Alert.alert(
                        'Block User',
                        'Are you sure you want to block this user? This will remove them from your chats.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Block',
                            style: 'destructive',
                            onPress: () => {
                              if (otherUser && user?.blockedUsers) {
                                user.blockedUsers.push(otherUser.id);
                                // Update chat status to blocked
                                if (chat) {
                                  chat.requestStatus = 'blocked';
                                }
                              }
                              router.back();
                              Alert.alert('Success', 'User blocked successfully');
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.profileButtonText, { color: Colors.accent }]}>
                      Block
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

export const styles = StyleSheet.create({
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
  groupHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupAvatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatarHeader: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.white,
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
  senderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 4,
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
  customHeader: {
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
  customHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customHeaderInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  customHeaderSubtitle: {
    fontSize: 13,
    color: '#E5E5E5',
  },
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  profileCard: {
    alignItems: 'center',
    width: '100%',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  profileButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  profileButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  profileButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  groupProfileContainer: {
    width: '100%',
    alignItems: 'center',
    maxHeight: 500,
  },
  groupHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  groupStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  membersList: {
    width: '100%',
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewProfileButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewProfileText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  groupActions: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  introContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  introAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  introName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  introHandle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  introButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  introButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  introActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  introIcon: {
    padding: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  emojiCloseButton: {
    padding: 4,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-around',
  },
  emojiItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  requestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 12,
    justifyContent: 'center',
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
  requestAcceptButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  requestAcceptText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  requestBlockButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  requestBlockText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
  
  
  