import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Users, Github, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { projects } from '@/mocks/data';
import { Project } from '@/types';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [likedProjects, setLikedProjects] = useState<Set<string>>(
    new Set(projects.filter(p => p.isLiked).map(p => p.id))
  );

  const toggleLike = (projectId: string) => {
    setLikedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'open':
        return Colors.success;
      case 'in-progress':
        return Colors.warning;
      case 'completed':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const renderProject = (project: Project) => {
    const isLiked = likedProjects.has(project.id);
    
    return (
      <TouchableOpacity
        key={project.id}
        style={styles.projectCard}
        onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectOwner}>
            <Image source={{ uri: project.owner.avatar }} style={styles.ownerAvatar} />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{project.owner.name}</Text>
              <Text style={styles.ownerMajor}>{project.owner.major}</Text>
            </View>
          </View>
          
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(project.status) },
              ]}
            >
              {getStatusText(project.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.projectTitle}>{project.title}</Text>
        <Text style={styles.projectDescription}>{project.description}</Text>
        
        <View style={styles.projectTags}>
          {project.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.projectFooter}>
          <View style={styles.projectMembers}>
            <Users size={18} color={Colors.textSecondary} />
            <Text style={styles.projectMembersText}>
              {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
          
          <View style={styles.projectActions}>
            {project.githubRepo && (
              <TouchableOpacity style={styles.githubButton}>
                <Github size={18} color={Colors.text} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => toggleLike(project.id)}
            >
              <Heart
                size={18}
                color={isLiked ? Colors.accent : Colors.textSecondary}
                fill={isLiked ? Colors.accent : 'transparent'}
              />
              <Text
                style={[
                  styles.likeCount,
                  isLiked && { color: Colors.accent },
                ]}
              >
                {isLiked ? project.likes + 1 : project.likes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Explore Projects</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-project')}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          {projects.map(renderProject)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  ownerMajor: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  projectMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectMembersText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  githubButton: {
    padding: 4,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
