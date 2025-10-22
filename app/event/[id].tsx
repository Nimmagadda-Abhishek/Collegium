import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { events } from '@/mocks/data';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const event = events.find(e => e.id === id);

  const [isAttending, setIsAttending] = useState(event?.isAttending || false);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: event.title,
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.white },
        }}
      />

      {/* Event Banner with Title Overlay */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: event.image }}
          style={styles.image}
        />
        <View style={styles.titleOverlay}>
          <Text style={styles.title}>{event.title}</Text>
        </View>
      </View>
    <View style={styles.detailBox}>
      

      {/* Event Content */}
      <View style={styles.content}>
        {/* Event Details */}
        <View style={styles.detailsRow}>
          <Calendar size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Clock size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{event.time}</Text>
        </View>

        <View style={styles.detailsRow}>
          <MapPin size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{event.description}</Text>

        
      </View>

      {/* Category and RSVP Row */}
      <View style={styles.topRow}>

        {/* Attendees */}
        <View style={styles.attendeesRow}>
          <Users size={20} color={Colors.textSecondary} />
          <Text style={styles.attendeesText}>
            {isAttending ? event.attendees + 1 : event.attendees} attending
          </Text>
        </View>

        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        <TouchableOpacity
          style={[styles.rsvpButton, isAttending && styles.rsvpButtonActive]}
          onPress={() => setIsAttending(!isAttending)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.rsvpButtonText,
              isAttending && styles.rsvpButtonTextActive,
            ]}
          >
            {isAttending ? 'Attending' : 'RSVP'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  
  imageWrapper: {
    width: '100%',
    height: 600,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleOverlay: {
    position: 'absolute',
    left: 16,
    top: '80%',
    
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  detailBox: {
    flexDirection: 'row',
    justifyContent:'space-between',
    margin:20
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: 15,
    marginTop: 10,
    marginHorizontal: 16,
  },
  categoryTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  rsvpButtonActive: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  rsvpButtonTextActive: {
    color: Colors.primary,
  },

  content: {
    padding: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginVertical: 20,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
    gap: 8,
  },
  attendeesText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: Colors.textSecondary },
});