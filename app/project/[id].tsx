import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, GitCommit, Users, Github, MessageCircle, AlertCircle ,ArrowLeft} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { currentUser, projects } from '@/mocks/data';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
}

interface Commit {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  sha: string;
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const project = projects.find(p => p.id === id);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'commits'>('chat');
  const [messageText, setMessageText] = useState<string>('');
  const [inputHeight, setInputHeight] = useState(40);
  const tabIndicator = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=45',
      message: 'Hey team! Just pushed the initial setup. Let me know if you have any questions.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '2',
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=33',
      message: 'Looks great! I will start working on the authentication module.',
      timestamp: new Date(Date.now() - 7100000).toISOString(),
    },
    {
      id: '3',
      userId: '3',
      userName: 'Marcus Williams',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      message: 'I can help with the backend API. Should we use Express or Fastify?',
      timestamp: new Date(Date.now() - 7000000).toISOString(),
    },
  ]);

  const [commits, setCommits] = useState<Commit[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      message: 'Initial project setup with React Native and TypeScript',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      sha: 'a1b2c3d',
    },
    {
      id: '2',
      author: 'Alex Johnson',
      message: 'Add authentication screens and navigation',
      timestamp: new Date(Date.now() - 82800000).toISOString(),
      sha: 'e4f5g6h',
    },
    {
      id: '3',
      author: 'Marcus Williams',
      message: 'Setup Express server with MongoDB connection',
      timestamp: new Date(Date.now() - 79200000).toISOString(),
      sha: 'i7j8k9l',
    },
    {
      id: '4',
      author: 'Sarah Chen',
      message: 'Implement user profile screen with edit functionality',
      timestamp: new Date(Date.now() - 75600000).toISOString(),
      sha: 'm0n1o2p',
    },
  ]);

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    setInputHeight(40);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTabChange = (tab: 'chat' | 'commits') => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'chat' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const openGithubRepo = () => {
    if (project?.githubRepo) {
      Linking.openURL(project.githubRepo).catch(() => {
        alert('Unable to open GitHub repository');
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.userId === currentUser.id;
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMsg || prevMsg.userId !== item.userId;

    return (
      <View style={[styles.messageContainer, isCurrentUser && styles.messageContainerRight]}>

        {/* <Stack.Screen
        options={{
          title: 'Project ',
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.white },
        }}
      />     */}
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Image source={{ uri: item.userAvatar }} style={styles.messageAvatar} />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}
        <View style={[styles.messageBubble, isCurrentUser && styles.messageBubbleRight]}>
          {!isCurrentUser && showAvatar && (
            <Text style={styles.messageName}>{item.userName}</Text>
          )}
          <Text style={[styles.messageText, isCurrentUser && styles.messageTextRight]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isCurrentUser && styles.messageTimeRight]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        {isCurrentUser && (
          <Image source={{ uri: item.userAvatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  const renderCommit = ({ item }: { item: Commit }) => (
    <View style={styles.commitCard}>
      <View style={styles.commitHeader}>
        <View style={styles.commitIconContainer}>
          <GitCommit size={18} color={Colors.primary} />
        </View>
        <View style={styles.commitInfo}>
          <Text style={styles.commitAuthor}>{item.author}</Text>
          <Text style={styles.commitTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <View style={styles.commitSha}>
          <Text style={styles.commitShaText}>{item.sha}</Text>
        </View>
      </View>
      <Text style={styles.commitMessage}>{item.message}</Text>
    </View>
  );

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={64} color={Colors.textSecondary} />
        <Text style={styles.errorTitle}>Project Not Found</Text>
        <Text style={styles.errorDescription}>
          The project you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const translateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
      <Stack.Screen
        options={{
          title: project.title,
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.text,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.projectHeader}>
        <View style={styles.projectHeadingView}>
          <Text style={styles.projectHeading} numberOfLines={2}>
            {project.title}
          </Text>
          <Text style={styles.projectDescription} numberOfLines={3}>
            {project.description}
          </Text>
        </View>

        <View style={styles.projectMeta}>
          <View style={styles.membersContainer}>
            <Users size={16} color={Colors.textSecondary} />
            <View style={styles.memberAvatars}>
              {project.members.slice(0, 3).map((member, index) => (
                <Image
                  key={member.id}
                  source={{ uri: member.avatar }}
                  style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                />
              ))}
              {project.members.length > 3 && (
                <View style={[styles.memberAvatar, styles.memberMore, { marginLeft: -8 }]}>
                  <Text style={styles.memberMoreText}>+{project.members.length - 3}</Text>
                </View>
              )}
            </View>
            <Text style={styles.memberCount}>{project.members.length} members</Text>
          </View>

          <TouchableOpacity
            style={styles.githubButton}
            onPress={openGithubRepo}
            activeOpacity={0.7}
          >
            <Github size={16} color={Colors.primary} />
            <Text style={styles.githubButtonText}>View Repo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX }],
            },
          ]}
        />
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabChange('chat')}
          activeOpacity={0.7}
        >
          <MessageCircle
            size={18}
            color={activeTab === 'chat' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === 'chat' && styles.tabButtonTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabChange('commits')}
          activeOpacity={0.7}
        >
          <GitCommit
            size={18}
            color={activeTab === 'commits' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.tabButtonText, activeTab === 'commits' && styles.tabButtonTextActive]}
          >
            Commits
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />

          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            <View style={[styles.inputWrapper, { minHeight: Math.min(inputHeight, 100) }]}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                onContentSizeChange={e => {
                  setInputHeight(e.nativeEvent.contentSize.height);
                }}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim()}
              activeOpacity={0.8}
            >
              <Send size={20} color={messageText.trim() ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlatList
          data={commits}
          renderItem={renderCommit}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.commitsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <GitCommit size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No commits yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop:50,
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  projectHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  projectHeadingView: {
    alignItems: 'center',
    marginBottom: 16,
  },
  projectHeading: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.backgroundSecondary,
  },
  memberMore: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  memberCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  githubButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width / 2,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageContainerRight: {
    flexDirection: 'row-reverse',
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
    maxWidth: '70%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  messageName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  messageTextRight: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    maxHeight: 80,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  commitsList: {
    padding: 16,
  },
  commitCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  commitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commitInfo: {
    flex: 1,
  },
  commitAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  commitTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  commitSha: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  commitShaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  commitMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});