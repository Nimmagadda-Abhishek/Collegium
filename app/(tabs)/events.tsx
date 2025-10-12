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
import { Calendar, MapPin, Users, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { events } from '@/mocks/data';
import { Event } from '@/types';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(
    new Set(events.filter(e => e.isAttending).map(e => e.id))
  );

  const toggleAttending = (eventId: string) => {
    setAttendingEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const renderEvent = (event: Event) => {
    const isAttending = attendingEvents.has(event.id);
    
    return (
      <View key={event.id} style={styles.eventCard}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        
        <View style={styles.eventContent}>
          <View style={styles.eventCategory}>
            <Text style={styles.eventCategoryText}>{event.category}</Text>
          </View>
          
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.eventDetailText}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.eventDetail}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.eventDetailText}>{event.time}</Text>
            </View>
          </View>
          
          <View style={styles.eventDetail}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
          
          <View style={styles.eventFooter}>
            <View style={styles.eventAttendees}>
              <Users size={18} color={Colors.textSecondary} />
              <Text style={styles.eventAttendeesText}>
                {isAttending ? event.attendees + 1 : event.attendees} attending
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                isAttending && styles.rsvpButtonActive,
              ]}
              onPress={() => toggleAttending(event.id)}
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
        <View style={styles.content}>
          {events.map(renderEvent)}
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
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventCategoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventAttendeesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rsvpButtonActive: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  rsvpButtonTextActive: {
    color: Colors.primary,
  },
});
