import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Github,
  MapPin,
  Calendar,
  Edit2,
  MessageCircle,
  Linkedin,
  Grid,
  Folder,
  Heart,
  MessageSquare,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { posts, projects, events } from '@/mocks/data';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'events'>('posts');

  if (!user) return null;

  const userPosts = posts.filter(p => p.userId === user.id);
  const userProjects = projects.filter(p => p.owner.id === user.id);
  const userEvents = events.filter(e => e.isAttending);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Settings size={22} color={Colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit2 size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.nameSection}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userProjects.length}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.bio}>{user.bio}</Text>

          <View style={styles.infoItems}>
            <View style={styles.infoRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{user.university}</Text>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{user.major} • {user.year}</Text>
            </View>
          </View>

          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Github size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>
                {user.githubUsername ? '@' + user.githubUsername : 'Link GitHub'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Linkedin size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>Link LinkedIn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit2 size={18} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/chats')}
            >
              <MessageCircle size={18} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Grid size={20} color={activeTab === 'posts' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
            onPress={() => setActiveTab('projects')}
          >
            <Folder size={20} color={activeTab === 'projects' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.tabActive]}
            onPress={() => setActiveTab('events')}
          >
            <Calendar size={20} color={activeTab === 'events' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Events</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <View style={styles.tabContent}>
            <Text style={styles.uploadCount}>{`Uploaded Posts: ${userPosts.length}`}</Text>
            {userPosts.length > 0 ? (
              <View style={styles.grid}>
                {userPosts.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridItem}
                    onPress={() => router.push(`/post/${post.id}`)}
                  >
                    <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No posts yet.</Text>
            )}
          </View>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <View style={styles.tabContent}>
            <Text style={styles.uploadCount}>{`Uploaded Projects: ${userProjects.length}`}</Text>
            {userProjects.length > 0 ? (
              <View style={styles.projectsList}>
                {userProjects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.projectCard}
                    onPress={() => router.push(`/project/${project.id}`)}
                  >
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <View style={styles.projectStatus}>
                        <Text style={styles.projectStatusText}>{project.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.projectDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                    <View style={styles.projectTags}>
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.projectTag}>
                          <Text style={styles.projectTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.projectFooter}>
                      <View style={styles.projectStat}>
                        <Heart size={16} color={Colors.textSecondary} />
                        <Text style={styles.projectStatText}>{project.likes}</Text>
                      </View>
                      <View style={styles.projectStat}>
                        <MessageSquare size={16} color={Colors.textSecondary} />
                        <Text style={styles.projectStatText}>{project.members.length} members</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No projects yet.</Text>
            )}
          </View>
        )}

        {/* Events Tab */}
                {/* Events Tab */}
        {activeTab === 'events' && (
          <View style={styles.tabContent}>
            <Text style={styles.uploadCount}>{`Events Attending: ${userEvents.length}`}</Text>
            {userEvents.length > 0 ? (
              <View style={styles.eventsList}>
                {userEvents.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => router.push(`/event/${event.id}`)}
                  >
                    <Image source={{ uri: event.image }} style={styles.eventImage} />
                    <View style={styles.eventContent}>
                      <View style={styles.eventCategory}>
                        <Text style={styles.eventCategoryText}>{event.category}</Text>
                      </View>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventMeta}>
                        <View style={styles.eventMetaItem}>
                          <Calendar size={14} color={Colors.textSecondary} />
                          <Text style={styles.eventMetaText}>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View style={styles.eventMetaItem}>
                          <MapPin size={14} color={Colors.textSecondary} />
                          <Text style={styles.eventMetaText} numberOfLines={1}>
                            {event.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>You are not attending any events yet.</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.white },
  headerGradient: { height: 120, paddingHorizontal: 20, paddingTop: 16 },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: { paddingHorizontal: 20, marginTop: -50 },
  avatarContainer: { position: 'relative', alignSelf: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.white },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  nameSection: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.backgroundSecondary, borderRadius: 16, padding: 16, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  content: { flex: 1 },
  infoSection: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white },
  bio: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 16 },
  infoItems: { gap: 8, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: Colors.textSecondary },
  socialLinks: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.text, borderRadius: 10, gap: 8 },
  socialButtonText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: Colors.primary + '15', borderRadius: 10, gap: 6 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, marginTop: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  uploadCount: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  noDataText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 20, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 2 },
  gridItem: { width: (width - 4) / 3, height: (width - 4) / 3, padding: 2 },
  gridImage: { width: '100%', height: '100%' },
  projectsList: { padding: 16 },
  projectCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  projectTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text },
  projectStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: Colors.primary + '20' },
  projectStatusText: { fontSize: 11, fontWeight: '600', color: Colors.primary, textTransform: 'capitalize' },
  projectDescription: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  projectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  projectTag: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  projectTagText: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  projectFooter: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  projectStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  projectStatText: { fontSize: 13, color: Colors.textSecondary },
  eventsList: { padding: 16, gap: 2, marginHorizontal: 8 },
  eventCard: { backgroundColor: Colors.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  eventImage: { width: '100%', height: 400 },
  eventContent: { padding: 12 },
  eventCategory: { alignSelf: 'flex-start', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  eventCategoryText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  eventTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', gap: 12 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  eventMetaText: { fontSize: 12, color: Colors.textSecondary },
});