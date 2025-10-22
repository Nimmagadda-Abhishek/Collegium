import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { events } from '@/mocks/data';
import { Calendar, Clock, MapPin, Users, Share2, Bell, BellOff, Heart } from 'lucide-react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const event = events.find(e => e.id === id);

  const [isAttending, setIsAttending] = useState(event?.isAttending || false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n${event.description}\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share event');
    }
  };

  const handleNotification = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    Alert.alert(
      isNotificationEnabled ? 'Notifications Off' : 'Notifications On',
      isNotificationEnabled 
        ? 'You will no longer receive notifications for this event' 
        : 'You will receive notifications for this event'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerTintColor: Colors.white,
        }}
      />

      {/* Hero Image with Gradient Overlay */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Title Overlay */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={24} 
              color={isFavorite ? Colors.accent : Colors.white}
              fill={isFavorite ? Colors.accent : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNotification}
          >
            {isNotificationEnabled ? (
              <Bell size={24} color={Colors.white} />
            ) : (
              <BellOff size={24} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Event Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Users size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Attendees</Text>
              <Text style={styles.detailText}>
                {isAttending ? event.attendees + 1 : event.attendees} people attending
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* RSVP Button */}
        <TouchableOpacity
          style={[styles.rsvpButton, isAttending && styles.rsvpButtonActive]}
          onPress={() => setIsAttending(!isAttending)}
          activeOpacity={0.9}
        >
          <Text style={[styles.rsvpButtonText, isAttending && styles.rsvpButtonTextActive]}>
            {isAttending ? '✓ You\'re Attending' : 'RSVP to Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroContainer: {
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  floatingActions: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  detailsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rsvpButtonActive: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rsvpButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  rsvpButtonTextActive: {
    color: Colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});