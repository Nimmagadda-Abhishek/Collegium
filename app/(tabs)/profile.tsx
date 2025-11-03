import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Modal,
  Share,
  Alert,
} from 'react-native';
import {
  Settings,
  Grid,
  Folder,
  Calendar,
  ArrowLeft,
  MoreVertical,
  Share2,
  Link,
  QrCode,
  Archive,
  Clock,
  LogOut,
  HelpCircle,
  X,
  FolderGit2,
  Users,
  Heart,
  Bookmark,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { posts, projects, events } from '@/mocks/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive columns
const getColumns = () => {
  if (SCREEN_WIDTH >= 1200) return 5;
  if (SCREEN_WIDTH >= 900) return 4;
  if (SCREEN_WIDTH >= 600) return 3;
  return 3;
};
const GRID_COLUMNS = getColumns();
const GRID_GAP = 6;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'events' | 'saved'>('posts');
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuSlideAnim = useRef(new Animated.Value(0)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;

  const userPosts = posts.filter(p => p.userId === user!.id);
  const userEvents = events.filter(e => e.isAttending);
  const userProjects = projects.filter(p => p.owner.id === user!.id || p.members.some(m => m.id === user!.id));
  const savedPostsData = posts.filter(p => user!.savedPosts?.includes(p.id));

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const index = activeTab === 'posts' ? 0 : activeTab === 'projects' ? 1 : activeTab === 'events' ? 2 : 3;
    Animated.spring(tabIndicator, { toValue: index, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }, [activeTab]);

  if (!user) return null;

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out ${user.name}'s profile on Collegium!` });
    } catch {
      Alert.alert('Error', 'Could not share profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(menuSlideAnim, { toValue: 1, useNativeDriver: true }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuSlideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setMenuVisible(false)
    );
  };

  const translateX = tabIndicator.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, SCREEN_WIDTH / 4, (SCREEN_WIDTH * 2) / 4, (SCREEN_WIDTH * 3) / 4],
  });

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          {/* <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>{user.name}</Text>
          <TouchableOpacity onPress={openMenu} style={styles.headerButton}>
            <MoreVertical size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info */}
        <View style={styles.profileWrapper}>
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userProjects.length}</Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userEvents.length}</Text>
                  <Text style={styles.statLabel}>Events</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.displayName}>{user.name}</Text>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
              <Text style={styles.university}>{user.university}</Text>
              <Text style={styles.majorYear}>{user.major} • {user.year}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {/* <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }] }]} /> */}
          {['posts', 'projects', 'events', 'saved'].map(tab => {
            const icons = { posts: Grid, projects: Folder, events: Calendar, saved: Bookmark };
            const Icon = icons[tab as keyof typeof icons];
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab as any)}
              >
                <Icon
                  size={24}
                  color={activeTab === tab ? Colors.primary : Colors.textSecondary}
                  strokeWidth={activeTab === tab ? 2.5 : 1.5}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Posts Grid */}
        {activeTab === 'posts' && (
          <View style={styles.gridContainer}>
            {userPosts.length > 0 ? (
              <View style={[styles.grid, { justifyContent: 'flex-start' }]}>
                {userPosts.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    onPress={() => router.push(`/post/${post.id}`)}
                    activeOpacity={0.9}
                    style={[styles.gridItem, { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }]}
                  >
                    <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<Grid size={64} color={Colors.border} />}
                title="No Posts"
                desc="Share your first post"
              />
            )}
          </View>
        )}

        {/* Projects List */}
        {activeTab === 'projects' && (
          <View style={styles.projectsContainer}>
            {userProjects.length ? (
              userProjects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/project/${project.id}`)}
                >
                  <View style={styles.projectHeader}>
                    <FolderGit2 size={24} color={Colors.primary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <Text style={styles.projectOwner}>by {project.owner.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription} numberOfLines={2}>{project.description}</Text>
                  <View style={styles.projectFooter}>
                    <View style={styles.projectTags}>
                      {project.tags.slice(0, 2).map((tag, i) => (
                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                      ))}
                    </View>
                    <View style={styles.projectStats}>
                      <Users size={14} color={Colors.textSecondary} />
                      <Text style={styles.projectStatText}>{project.members.length}</Text>
                      <Heart size={14} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
                      <Text style={styles.projectStatText}>{project.likes}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon={<Folder size={64} color={Colors.border} />}
                title="No Projects"
                desc="Start collaborating with others"
              />
            )}
          </View>
        )}

        {/* Events Grid */}
        {activeTab === 'events' && (
          <View style={styles.gridContainer}>
            {userEvents.length ? (
              <View style={[styles.grid, { justifyContent: 'flex-start',padding:GRID_GAP }]}>
                {userEvents.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => router.push(`/event/${event.id}`)}
                    activeOpacity={0.9}
                    style={[styles.gridItem, { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }]}
                  >
                    <Image source={{ uri: event.image }} style={styles.gridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<Calendar size={64} color={Colors.border} />}
                title="No Events"
                desc="Events you join will appear here"
              />
            )}
          </View>
        )}

        {/* Saved Posts Grid */}
        {activeTab === 'saved' && (
          <View style={styles.gridContainer}>
            {savedPostsData.length > 0 ? (
              <View style={[styles.grid, { justifyContent: 'flex-start' }]}>
                {savedPostsData.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    onPress={() => router.push(`/post/${post.id}`)}
                    activeOpacity={0.9}
                    style={[styles.gridItem, { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }]}
                  >
                    <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<Bookmark size={64} color={Colors.border} />}
                title="No Saved Posts"
                desc="Posts you save will appear here"
              />
            )}
          </View>
        )}
      </Animated.ScrollView>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMenu}>
          <Animated.View style={[styles.menuContainer, {
            transform: [{ translateY: menuSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }],
          }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Options</Text>
              <TouchableOpacity onPress={closeMenu}><X size={22} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView>
              <MenuItem icon={<Share2 size={22} color={Colors.text} />} label="Share Profile" onPress={handleShare} />
              <MenuItem icon={<Link size={22} color={Colors.text} />} label="Copy Link" onPress={() => console.log('Copy Link')} />
              <MenuItem icon={<QrCode size={22} color={Colors.text} />} label="Show QR Code" onPress={() => console.log('Show QR Code')} />
              <MenuItem icon={<Archive size={22} color={Colors.text} />} label="Archive" onPress={() => console.log('Archive')} />
              <MenuItem icon={<Clock size={22} color={Colors.text} />} label="Your Activity" onPress={() => console.log('Your Activity')} />
              <MenuItem icon={<Settings size={22} color={Colors.text} />} label="Settings" onPress={() => router.push('/settings')} />
              <MenuItem icon={<HelpCircle size={22} color={Colors.text} />} label="Help & Support" onPress={() => console.log('Help & Support')} />
              <MenuItem icon={<LogOut size={22} color={Colors.accent} />} label="Logout" danger onPress={handleLogout} />
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
    </>
  );
}

// Helper components
const MenuItem = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>{icon}</View>
    <Text style={[styles.menuText, danger && { color: Colors.accent }]}>{label}</Text>
  </TouchableOpacity>
);

const EmptyState = ({ icon, title, desc }: any) => (
  <View style={styles.emptyState}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },

  profileWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  profileSection: {
    width: SCREEN_WIDTH >= 900 ? '60%' : '100%',
    paddingHorizontal: 16,
    paddingTop: 20,
    alignSelf: 'center',
    backgroundColor: Colors.white,
  },
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    width: '100%',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 20,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  infoSection: { marginBottom: 10 },
  displayName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  bio: { fontSize: 14, color: Colors.textSecondary, marginVertical: 4 },
  university: { fontSize: 13, color: Colors.textSecondary },
  majorYear: { fontSize: 13, color: Colors.textSecondary },

  
actionButtons: {
  flexDirection: SCREEN_WIDTH >= 200 ? 'row' : 'column',
  gap: 10,
  marginTop: 12,
  justifyContent: 'center',
},

editButton: {
  flex: 1,
  backgroundColor: Colors.backgroundSecondary,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
},

editButtonText: {
  color: Colors.text,
  fontWeight: '600',
},

shareButton: {
  flex: 1,
  backgroundColor: Colors.backgroundSecondary,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
},

shareButtonText: {
  color: Colors.text,
  fontWeight: '600',
},

  tabsContainer: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border,marginVertical: 16, position: 'relative',width: SCREEN_WIDTH >= 900 ? '60%' : '100%',justifyContent:"center",alignSelf:"center", paddingHorizontal: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  // tabIndicator: { position: 'absolute', top: 0, height: 2, backgroundColor: Colors.primary, width: SCREEN_WIDTH/3 },

  gridContainer: { paddingTop: 4, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, justifyContent: 'center', maxWidth: 1300 },
  gridItem: { backgroundColor: Colors.backgroundSecondary, borderRadius: 8, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  projectsContainer: { padding: 16, alignItems: 'center' },
  projectCard: {
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 12, marginBottom: 12, width: SCREEN_WIDTH >= 600 ? '60%' : '100%',
  },
  projectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  projectTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  projectOwner: { fontSize: 13, color: Colors.textSecondary },
  projectDescription: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectTags: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  projectStats: { flexDirection: 'row', alignItems: 'center' },
  projectStatText: { marginLeft: 4, color: Colors.textSecondary, fontSize: 13 },



  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginVertical: 6, color: Colors.text },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuContainer: {
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  menuHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  menuTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  menuIcon: { width: 32, alignItems: 'center' },
  menuText: { fontSize: 15, marginLeft: 12, color: Colors.text },
});