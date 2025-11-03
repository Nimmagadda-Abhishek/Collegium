import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, Users, Calendar, Settings, FolderGit2, MessageSquare ,Heart, Images, Calendar as CalendarIcon, Plus} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { projects, events ,posts} from '@/mocks/data';
import PostsScreen from '@/app/posts';



export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'discover' | 'trending' | 'posts'>('discover');

  // Helper to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const upcomingEventsCount = events.filter(event => {
    const eventDateTime = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    return eventDateTime >= new Date();
  }).length;

  const stats = [
    { label: 'Active Projects', value: '127', icon: FolderGit2, color: Colors.primary },
    { label: 'Students', value: '2.4K', icon: Users, color: Colors.accent },
    { label: 'Upcoming Events', value: upcomingEventsCount.toString(), icon: CalendarIcon, color: '#10B981' },
  ];

  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.appName}>Collegium</Text>
          </View>
          <View style={styles.notificationButtons}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/create-post')}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Heart size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/chats')}
            >
              <MessageSquare size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={
                stat.label === 'Active Projects'
                  ? () => router.push('/active-projects')
                  : stat.label === 'Students'
                  ? () => router.push('/students')
                  : stat.label === 'Upcoming Events'
                  ? () => router.push('/upcoming-events')
                  : undefined
              }
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
      <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => setActiveTab('trending')}
          >
            <TrendingUp size={16} color={activeTab === 'trending' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            // onPress={() => router.push('/posts')}
            onPress={() => setActiveTab('posts')}
          >
            <Images size={16} color={activeTab === 'posts' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'discover' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Projects</Text>
              </View>
              {projects
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3)
                .map((project) => (
                  <TouchableOpacity key={project.id} style={styles.projectCard} onPress={() => router.push(`/project/${project.id}`)}>
                    <View style={styles.projectHeader}>
                      <View style={styles.projectIconContainer}>
                        <FolderGit2 size={24} color={Colors.primary} />
                      </View>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.projectOwner}>by {project.owner.name}</Text>
                      </View>
                    </View>
                    <Text style={styles.projectDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
              </View>
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 2)
                .map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push(`/event/${event.id}`)}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventMonth}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </Text>
                      <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        {activeTab === 'trending' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Projects</Text>
              </View>
              {projects
                .sort((a, b) => b.members.length - a.members.length)
                .slice(0, 3)
                .map((project) => (
                  <TouchableOpacity key={project.id} style={styles.projectCard} onPress={() => router.push(`/project/${project.id}`)}>
                    <View style={styles.projectHeader}>
                      <View style={styles.projectIconContainer}>
                        <FolderGit2 size={24} color={Colors.primary} />
                      </View>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.projectOwner}>by {project.owner.name}</Text>
                      </View>
                    </View>
                    <Text style={styles.projectDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Events</Text>
              </View>
              {events
                .sort((a, b) => b.attendees - a.attendees)
                .slice(0, 2)
                .map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push(`/event/${event.id}`)}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventMonth}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </Text>
                      <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventLocation}>{event.location}</Text>
                      <Text style={styles.eventAttendeesText}>{event.attendees} attending</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Posts</Text>
              </View>
              {posts
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 3)
                .map((post) => (
                  <TouchableOpacity key={post.id} style={styles.projectCard} onPress={() => router.push(`/post/${post.id}`)}>
                    <Text style={styles.projectTitle}>{post.user.name}</Text>
                    <Text numberOfLines={2} style={styles.projectDescription}>
                      {post.content}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        {activeTab === 'posts' && (
          <>
            {/* {posts.map((post) => (
              <View key={post.id} style={[styles.projectCard, { marginBottom: 16 }]}>
                <View style={styles.projectHeader}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{post.user.name}</Text>
                    <Text style={styles.projectOwner}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>

                <Text style={styles.projectDescription}>{post.content}</Text>

                {post.images.length > 0 && (
                  <Image
                    source={{ uri: post.images[0] }}
                    style={{ width: '100%', height: 200, borderRadius: 12, marginVertical: 10 }}
                    resizeMode="cover"
                  />
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Heart size={20} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.projectStatText}>{post.likes}</Text>
                  <MessageSquare size={20} color={Colors.textSecondary} style={{ marginLeft: 12, marginRight: 6 }} />
                  <Text style={styles.projectStatText}>{post.comments}</Text>
                </View>
              </View>
            ))} */}
            <PostsScreen/>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  notificationButtons:{
    flexDirection:'row',
    gap:10,
  },
  notificationButton: {
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  projectOwner: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.accent + '15',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  eventDay: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttendeesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  eventBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
