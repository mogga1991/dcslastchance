import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
  id: string;
  type: 'match' | 'interest' | 'proposal' | 'win' | 'view';
  title: string;
  description: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match Found',
    description: 'GSA Lease - Office Space in DC (94% match)',
    time: '30m ago',
    icon: 'flash',
    iconColor: '#4F46E5',
  },
  {
    id: '2',
    type: 'interest',
    title: 'Marked as Interested',
    description: 'State Department Consular Services Office',
    time: '2h ago',
    icon: 'checkmark-circle',
    iconColor: '#10B981',
  },
  {
    id: '3',
    type: 'win',
    title: 'Opportunity Won',
    description: 'DOE Energy Information Admin Office - $2.5M contract',
    time: '1d ago',
    icon: 'trophy',
    iconColor: '#F59E0B',
  },
  {
    id: '4',
    type: 'proposal',
    title: 'Proposal Submitted',
    description: 'VA Healthcare Center Lease Opportunity',
    time: '2d ago',
    icon: 'document-text',
    iconColor: '#8B5CF6',
  },
  {
    id: '5',
    type: 'view',
    title: 'Property Viewed',
    description: 'Downtown Federal Building - 5 agency views',
    time: '3d ago',
    icon: 'eye',
    iconColor: '#6B7280',
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSubtitle}>Your recent actions and updates</Text>
        </View>
      </View>

      {/* Activity List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Recent</Text>
        {MOCK_ACTIVITIES.map((activity, index) => (
          <View key={activity.id} style={styles.activityItem}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${activity.iconColor}15` }]}>
              <Ionicons name={activity.icon} size={16} color={activity.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>

            {/* Timeline Line */}
            {index < MOCK_ACTIVITIES.length - 1 && <View style={styles.timelineLine} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  timelineLine: {
    position: 'absolute',
    left: 19.5,
    top: 48,
    bottom: 0,
    width: 1,
    backgroundColor: '#E5E7EB',
  },
});
