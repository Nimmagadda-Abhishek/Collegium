import React, { useState } from 'react';
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
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, GitCommit, Users, Github, MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { currentUser, projects } from '@/mocks/data';

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
  const project = projects.find(p => p.id === id);
console.log(project)

  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'chat' | 'commits'>('chat');
  const [messageText, setMessageText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=45',
      message: 'Hey team! Just pushed the initial setup. Let me know if you have any questions.',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=33',
      message: 'Looks great! I will start working on the authentication module.',
      timestamp: '2024-01-15T10:35:00Z',
    },
    {
      id: '3',
      userId: '3',
      userName: 'Marcus Williams',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      message: 'I can help with the backend API. Should we use Express or Fastify?',
      timestamp: '2024-01-15T10:40:00Z',
    },
  ]);

  

  const [commits, setCommits] = useState<Commit[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      message: 'Initial project setup with React Native and TypeScript',
      timestamp: '2024-01-15T10:00:00Z',
      sha: 'a1b2c3d',
    },
    {
      id: '2',
      author: 'Alex Johnson',
      message: 'Add authentication screens and navigation',
      timestamp: '2024-01-15T11:30:00Z',
      sha: 'e4f5g6h',
    },
    {
      id: '3',
      author: 'Marcus Williams',
      message: 'Setup Express server with MongoDB connection',
      timestamp: '2024-01-15T13:00:00Z',
      sha: 'i7j8k9l',
    },
    {
      id: '4',
      author: 'Sarah Chen',
      message: 'Implement user profile screen with edit functionality',
      timestamp: '2024-01-15T14:30:00Z',
      sha: 'm0n1o2p',
    },
  ]);

  // const projectInfo = {
  //   title: 'Campus Navigation App',
  //   description: 'AR-based navigation system to help students find classrooms and facilities easily.',
  //   members: [
  //     { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=33' },
  //     { id: '2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=45' },
  //     { id: '3', name: 'Marcus Williams', avatar: 'https://i.pravatar.cc/150?img=12' },
  //   ],
  //   githubRepo: 'https://github.com/collegium/campus-nav',
  // };

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.userId === currentUser.id;
    
    return (
      <View style={[styles.messageContainer, isCurrentUser && styles.messageContainerRight]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.userAvatar }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isCurrentUser && styles.messageBubbleRight]}>
          {!isCurrentUser && (
            <Text style={styles.messageName}>{item.userName}</Text>
          )}
          <Text style={[styles.messageText, isCurrentUser && styles.messageTextRight]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isCurrentUser && styles.messageTimeRight]}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
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
          <Text style={styles.commitTime}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.commitSha}>
          <Text style={styles.commitShaText}>{item.sha}</Text>
        </View>
      </View>
      <Text style={styles.commitMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project?.title,
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: Colors.text,
          },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.projectHeader}>
        <View style={styles.projectHeadingview}>
          {project ? (
            <>
              <Text style={styles.projectHeading}>{project.title}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
            </>
          ) : (
            <Text style={styles.projectHeading}>Project not found</Text>
          )}
        </View>
        
        
        <View style={styles.projectMeta}>
          <View style={styles.membersContainer}>
            <Users size={16} color={Colors.textSecondary} />
            <View style={styles.memberAvatars}>
              {project?.members.slice(0, 3).map((member, index) => (
                <Image
                  key={member.id}
                  source={{ uri: member.avatar }}
                  style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                />
              ))}
            </View>
            <Text style={styles.memberCount}>{project ? project.members.length : 0} members</Text>
          </View>

          <TouchableOpacity style={styles.githubButton} onPress={() => project?.githubRepo && Linking.openURL(project.githubRepo)}>
            <Github size={16} color={Colors.primary} />
            <Text style={styles.githubButtonText}>View Repo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={18} color={activeTab === 'chat' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'chat' && styles.tabButtonTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'commits' && styles.tabButtonActive]}
          onPress={() => setActiveTab('commits')}
        >
          <GitCommit size={18} color={activeTab === 'commits' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'commits' && styles.tabButtonTextActive]}>
            Commits
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textLight}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim()}
            >
              <Send size={20} color={messageText.trim() ? Colors.white : Colors.textLight} />
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  projectHeadingview: {
    textAlign:'center',
    height:100,
  },
  projectHeading: {
    textAlign:'center',
    fontSize:40,
    fontWeight:700,
  },
  projectHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 40,
    marginBottom: 12,
    textAlign:'center',
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
  },
  memberCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  githubButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageContainerRight: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '70%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  messageName: {
    fontSize: 12,
    fontWeight: '600' as const,
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
    color: Colors.textLight,
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
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  commitMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
