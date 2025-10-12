export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  university: string;
  major: string;
  year: string;
  githubUsername?: string;
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  image: string;
  createdAt: string;
  viewed: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  organizer: User;
  attendees: number;
  isAttending: boolean;
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  owner: User;
  members: User[];
  tags: string[];
  githubRepo?: string;
  status: 'open' | 'in-progress' | 'completed';
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  likes: number;
}
