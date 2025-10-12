import { Tabs, Redirect } from 'expo-router';
import { Home, Calendar, FolderGit2, MessageCircle, User } from 'lucide-react-native';
import React from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          headerShown: true,
          headerTitle: 'Events',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: Colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <FolderGit2 size={24} color={color} />,
          headerShown: true,
          headerTitle: 'Projects',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: Colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
          headerShown: true,
          headerTitle: 'Messages',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: Colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: Colors.white,
          },
          headerTintColor: Colors.white,
        }}
      />
    </Tabs>
  );
}
