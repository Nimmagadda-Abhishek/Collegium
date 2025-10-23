import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
  Share,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { posts } from '@/mocks/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const post = posts.find(p => p.id === id);

  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [showComments, setShowComments] = useState(false);

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.user.name} says: ${post.content}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
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

  const getResponsiveMargin = () => {
    if (SCREEN_WIDTH < 768) return 0;
    if (SCREEN_WIDTH < 1024) return 100;
    return Math.max(200, (SCREEN_WIDTH - 1200) / 2);
  };

  const getImageDimensions = () => {
    const containerWidth = SCREEN_WIDTH - getResponsiveMargin() * 2;
    const imageWidth = SCREEN_WIDTH < 768 ? containerWidth : containerWidth;
    const aspectRatio = 16 / 9;
    return {
      width: imageWidth,
      height: imageWidth / aspectRatio,
    };
  };

  const imageDimensions = getImageDimensions();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: getResponsiveMargin(), paddingBottom: 20 }}
    >
      {/* Back Button + Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
      </View>

      {/* Post Card */}
      <View style={styles.postCard}>
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
              <Image
                source={{ uri: post.images[0] }}
                style={[styles.singleImage, imageDimensions]}
                resizeMode="cover"
              />
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
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / imageDimensions.width
                  );
                  setCurrentImageIndex({ [post.id]: index });
                }}
                renderItem={({ item }) => (
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item }}
                      style={[styles.carouselImage, imageDimensions]}
                      resizeMode="cover"
                    />
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

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart
              size={22}
              color={liked ? Colors.error : Colors.textSecondary}
              fill={liked ? Colors.error : 'transparent'}
            />
            <Text style={[styles.actionText, liked && { color: Colors.error }]}>{likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(!showComments)}
          >
            <MessageCircle size={22} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={22} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
            <Bookmark size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background,paddingVertical:50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: Colors.textSecondary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  backButton: { paddingHorizontal: 16, paddingVertical: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },

  postCard: {
    backgroundColor: Colors.white,
    marginVertical: 16,
    borderRadius: Platform.OS === 'web' ? 12 : 0,
    paddingVertical: 8,
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
});