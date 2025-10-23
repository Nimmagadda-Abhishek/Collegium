import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { posts } from '@/mocks/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PostsScreen() {
  const router = useRouter();
  const [postsData, setPostsData] = useState(posts);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [commentsOpen, setCommentsOpen] = useState<{ [key: string]: boolean }>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const getResponsiveMargin = () => {
    if (screenWidth < 768) return 0;
    if (screenWidth < 1024) return 100;
    return Math.max(200, (screenWidth - 1200) / 2);
  };

  const getImageDimensions = () => {
    const containerWidth = screenWidth - getResponsiveMargin() * 2;
    const imageWidth = screenWidth < 768 ? containerWidth : containerWidth;
    const aspectRatio = 16 / 9;
    return { width: imageWidth, height: imageWidth / aspectRatio };
  };

  const handleLike = (postId: string) => {
    setPostsData(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleShare = async (post: typeof posts[0]) => {
    try {
      await Share.share({ message: `${post.user.name} says: ${post.content}` });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const imageDimensions = getImageDimensions();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Posts',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/create-post')} style={styles.createButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: getResponsiveMargin() }]}
      >
        {postsData.map(post => (
          <Animated.View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {post.images.length > 0 && (
              <View style={styles.imagesContainer}>
                {post.images.length === 1 ? (
                  <Image source={{ uri: post.images[0] }} style={[styles.singleImage, imageDimensions]} resizeMode="cover" />
                ) : (
                  <FlatList
                    data={post.images}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={imageDimensions.width}
                    decelerationRate="fast"
                    onMomentumScrollEnd={event => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / imageDimensions.width);
                      setCurrentImageIndex(prev => ({ ...prev, [post.id]: index }));
                    }}
                    renderItem={({ item }) => (
                      <View style={{ position: 'relative' }}>
                        <Image source={{ uri: item }} style={[styles.carouselImage, imageDimensions]} resizeMode="cover" />
                        <View style={styles.imageCounter}>
                          <Text style={styles.imageCounterText}>
                            {(currentImageIndex[post.id] ?? 0) + 1} / {post.images.length}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>
            )}

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
                <Heart size={22} color={post.isLiked ? Colors.error : Colors.textSecondary} fill={post.isLiked ? Colors.error : 'transparent'} />
                <Text style={[styles.actionText, post.isLiked && { color: Colors.error }]}>{post.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => toggleComments(post.id)}>
                <MessageCircle size={22} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(post)}>
                <Share2 size={22} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.shares}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
                <Bookmark size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Comments Section */}
            {commentsOpen[post.id] && (
              <View style={styles.commentsSection}>
                {post.commentsList?.length ? (
                  post.commentsList.map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noComments}>No comments yet</Text>
                )}
              </View>
            )}

            {/* <View style={styles.divider} /> */}
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },
  createButton: { marginRight: 8 },
  postCard: {
    backgroundColor: Colors.white,
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: Platform.OS === 'web' ? 12 : 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  postTime: { fontSize: 13, color: Colors.textSecondary },
  postContent: { fontSize: 15, color: Colors.text, lineHeight: 22, paddingHorizontal: 16, marginBottom: 12 },
  imagesContainer: { marginBottom: 12, overflow: 'hidden' },
  singleImage: { backgroundColor: Colors.backgroundSecondary },
  carouselImage: { backgroundColor: Colors.backgroundSecondary },
  imageCounter: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  imageCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  postActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20, padding: 4 },
  actionText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6, fontWeight: '500' },
  commentsSection: { paddingHorizontal: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  commentItem: { marginBottom: 8 },
  commentUser: { fontWeight: '600', color: Colors.text },
  commentText: { color: Colors.textSecondary, marginLeft: 4 },
  noComments: { color: Colors.textSecondary, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: Colors.border, marginTop: 16, marginHorizontal: 16 },
});