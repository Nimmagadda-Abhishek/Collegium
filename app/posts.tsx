import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { posts } from '@/mocks/data';

const { width } = Dimensions.get('window');

export default function PostsScreen() {
  const router = useRouter();
  const [postsData, setPostsData] = useState(posts);

  const handleLike = (postId: string) => {
    setPostsData(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
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


  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    setScreenWidth(window.width);
  });
  return () => subscription?.remove();
}, []);

const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  return (
    <View
      style={[
        styles.container,
        { marginHorizontal: screenWidth > 1024 ? 600 : 0 }, // ✅ Dynamic margin
      ]}
    >
      <Stack.Screen
        options={{
          title: 'Posts',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/create-post')}
              style={styles.createButton}
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} >
        {postsData.map(post => (
          <View key={post.id} style={styles.postCard}>
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
                  style={styles.singleImage}
                  resizeMode='contain'
                />
              ) : (
                <FlatList
                  data={post.images}
                  keyExtractor={(_, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={event => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                    );
                    setCurrentImageIndex(prev => ({ ...prev, [post.id]: index }));
                  }}
                  renderItem={({ item, index }) => (
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: item }}
                        style={styles.carouselImage}
                        resizeMode="contain"
                      />
                      {/* Image count overlay */}
                      <View style={styles.imageCounter}>
                        <Text style={styles.imageCounterText}>
                          { (currentImageIndex[post.id] ?? 0) + 1 } / {post.images.length}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          )}

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(post.id)}
              >
                <Heart
                  size={22}
                  color={post.isLiked ? Colors.error : Colors.textSecondary}
                  fill={post.isLiked ? Colors.error : 'transparent'}
                />
                <Text
                  style={[
                    styles.actionText,
                    post.isLiked && { color: Colors.error },
                  ]}
                >
                  {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={22} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Share2 size={22} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.shares}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
                <Bookmark size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
          </View>
        ))}
        
      </ScrollView>
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // margin:20,
  },
  createButton: {
    marginRight: 8,
  },
  postCard: {
    backgroundColor: Colors.white,
    marginBottom: 16,
    paddingVertical: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  singleImage: {
    width: 1280,
    height: 720,
    backgroundColor: Colors.backgroundSecondary,
  },
  multipleImages: {
    flexDirection: 'row',
    
  },
  carouselImage: {
    width: 1280, // full screen width for swipe
    height: 720, // square
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 0, // no gap between slides
  },
  imageCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gridImage: {
    width: width / 2,
    height: width / 2,
    backgroundColor: Colors.backgroundSecondary,
  },
  twoImages: {
    width: width / 2,
    height: width / 2,
  },
  threeImagesFirst: {
    width: width,
    height: width / 2,
  },
  threeImagesOther: {
    width: width / 2,
    height: width / 2,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,                     // thin line
    backgroundColor: '#C0C0C0',  // dark gray or black
            // optional: align with post padding
    marginTop: 32,             // spacing above and below line
  },
});
