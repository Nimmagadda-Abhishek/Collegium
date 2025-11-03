import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import {
  Heart,
  MessageSquare,
  Share2,
  Filter,
  ArrowLeft,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { router } from "expo-router";
// import profileplaceholder from "../media/images/profileplaceholder.png";
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  user: string;
  type: "like" | "comment" | "share";
  message: string;
  source: "post" | "project" | "event";
  time: string;
  createdAt: Date;
  read: boolean;
}

// Mock notifications data
const sampleNotifications: Notification[] = [
  {
    id: "1",
    user: "Anil",
    type: "like",
    message: "liked your post",
    source: "post",
    time: "2h ago",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    user: "Priya",
    type: "comment",
    message: "commented on your project",
    source: "project",
    time: "1d ago",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "3",
    user: "Rahul",
    type: "share",
    message: "shared your event",
    source: "event",
    time: "5d ago",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "4",
    user: "Sneha",
    type: "like",
    message: "liked your project",
    source: "project",
    time: "10d ago",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  // Filters
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<string>("all");

  const [notifications, setNotifications] = useState(sampleNotifications);

  // Filter by Date
  const filterByDate = (notification: Notification): boolean => {
    if (filter === "all") return true;
    const now = new Date();
    const diff =
      (now.getTime() - notification.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);
    if (filter === "24hrs") return diff <= 1;
    if (filter === "yesterday") return diff > 1 && diff <= 2;
    if (filter === "1week") return diff <= 7;
    if (filter === "1month") return diff <= 30;
    return true;
  };

  // Filter and Sort Data
  const filtered = notifications
    .filter(filterByDate)
    .filter((n) => (sourceType === "all" ? true : n.source === sourceType))
    .filter((n) => (sortType ? n.type === sortType : true));

  // Section Groups
  const now = new Date();
  const newItems = filtered.filter(
    (n) => now.getTime() - n.createdAt.getTime() <= 24 * 60 * 60 * 1000
  );
  const earlierItems = filtered.filter(
    (n) =>
      now.getTime() - n.createdAt.getTime() > 24 * 60 * 60 * 1000 &&
      now.getTime() - n.createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000
  );
  const olderItems = filtered.filter(
    (n) => now.getTime() - n.createdAt.getTime() > 7 * 24 * 60 * 60 * 1000
  );

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))}>
      <View style={[styles.notificationCard, { backgroundColor: item.read ? Colors.backgroundSecondary : "#E6F0FF" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {/* Placeholder for user avatar or icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.backgroundSecondary,
              
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Image
              // source={profileplaceholder}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.messageText}>
              <Text style={styles.username}>{item.user} </Text>
              {item.message}
            </Text>
            <Text style={styles.sourceText}>
              • {item.source.charAt(0).toUpperCase() + item.source.slice(1)}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          {item.type === "like" && <Heart color={Colors.error} size={20} />}
          {item.type === "comment" && (
            <MessageSquare color={Colors.primary} size={20} />
          )}
          {item.type === "share" && <Share2 color={Colors.accent} size={20} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Section rendering helper
  const renderSection = (title: string, data: Notification[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((item) => (
          <View key={item.id}>{renderNotification({ item })}</View>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters((s) => !s)}
              accessibilityLabel="Show filters"
              accessibilityRole="button"
            >
              <Filter size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Modal/Dropdown Section */}
        {showFilters && (
          <View style={styles.filterDropdown}>
            {/* Time Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {["all", "24hrs", "yesterday", "1week", "1month"].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filter === f && styles.activeChip]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.activeFilterText,
                    ]}
                  >
                    {f === "all"
                      ? "All"
                      : f === "24hrs"
                      ? "In 24 hrs"
                      : f === "yesterday"
                      ? "Yesterday"
                      : f === "1week"
                      ? "In 1 week"
                      : "In 1 month"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort by Type */}
            <View style={styles.sortContainer}>
              {[
                { label: "Likes", type: "like", color: Colors.error },
                { label: "Comments", type: "comment", color: Colors.primary },
                { label: "Shares", type: "share", color: Colors.accent },
              ].map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.sortButton,
                    sortType === option.type && {
                      backgroundColor: option.color + "25",
                    },
                  ]}
                  onPress={() =>
                    setSortType(sortType === option.type ? null : option.type)
                  }
                >
                  <Text
                    style={[
                      styles.sortText,
                      sortType === option.type && {
                        color: option.color,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter by Source */}
            <View style={styles.sortContainer}>
              {[
                { label: "All", type: "all", color: Colors.text },
                { label: "Projects", type: "project", color: Colors.primary },
                { label: "Events", type: "event", color: Colors.success },
                { label: "Posts", type: "post", color: Colors.accent },
              ].map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.sortButton,
                    sourceType === option.type && {
                      backgroundColor: option.color + "25",
                    },
                  ]}
                  onPress={() => setSourceType(option.type as any)}
                >
                  <Text
                    style={[
                      styles.sortText,
                      sourceType === option.type && {
                        color: option.color,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Notification Sections */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {renderSection("New", newItems)}
          {renderSection("Earlier", earlierItems)}
          {renderSection("Older", olderItems)}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No notifications found</Text>
          )}
        </ScrollView>
      </View>
    </>
  );
}

// Fallback color definitions (if not present in Colors)
Colors.primaryDark = Colors.primaryDark || "#1E3A8A";
Colors.borderLight = Colors.borderLight || "#E5E7EB";
Colors.backgroundSecondary = Colors.backgroundSecondary || "#F7F8FA";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  filterButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    padding: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: { paddingHorizontal: 16, marginTop: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  activeChip: { backgroundColor: Colors.primary + "20" },
  filterText: { color: Colors.textSecondary, fontWeight: "600", fontSize: 13 },
  activeFilterText: { color: Colors.primary },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 26,
    backgroundColor: Colors.white,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortText: { color: Colors.textSecondary, fontWeight: "600" },
  filterDropdown: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    paddingBottom: 8,
    elevation: 2,
    zIndex: 10,
  },
  sectionGroup: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    paddingBottom: 4,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  messageText: { color: Colors.text, fontSize: 14, fontWeight: "500" },
  username: { fontWeight: "700", color: Colors.primary },
  sourceText: { color: Colors.textLight, fontSize: 12 },
  timeText: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  emptyText: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 14,
  },
});
