import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { posts } from '@/mocks/data';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react-native';

const { height, width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const post = posts.find(p => p.id === id);

  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Stack.Screen
        options={{
          title: 'Post',
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.white },
        }}
      />

      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Images */}
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
                setCurrentImageIndex(index);
              }}
              renderItem={({ item }) => (
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="contain"
                  />
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {currentImageIndex + 1} / {post.images.length}
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
          <Heart size={22} color={liked ? Colors.error : Colors.textSecondary} fill={liked ? Colors.error : 'transparent'} />
          <Text style={[styles.actionText, liked && { color: Colors.error }]}>{likes}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
    height: height * 0.9, // 90vh for web
    
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: Colors.textSecondary },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  postTime: { fontSize: 13, color: Colors.textSecondary },

  postContent: { fontSize: 15, color: Colors.text, lineHeight: 22, paddingHorizontal: 16, marginBottom: 12 },

  imagesContainer: { marginBottom: 12 },
  singleImage: { width: width, height: height * 0.75, backgroundColor: Colors.backgroundSecondary },
  carouselImage: { width: width, height: width * 0.75, backgroundColor: Colors.backgroundSecondary },
  imageCounter: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  imageCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  postActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6, fontWeight: '500' },
});