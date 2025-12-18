import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface OpportunityMatch {
  id: string;
  title: string;
  agency: string;
  agencyDepartment: string;
  solicitation_number: string;
  location: string;
  match_score: number;
  deadline: string;
  estimated_value: string;
  property_title: string;
  is_hot_match: boolean;
  is_expired: boolean;
  matchReasons: { text: string; met: boolean }[];
}

const MOCK_MATCHES: OpportunityMatch[] = [
  {
    id: '1',
    title: 'GSA Lease - Office Space in Washington DC Metro Area, 125,000 SF',
    agency: 'GSA',
    agencyDepartment: 'General Services Administration - Public Buildings Service',
    solicitation_number: '47PA0025R0001',
    location: 'Washington, DC',
    match_score: 94,
    deadline: 'Feb 15, 2025',
    estimated_value: '$6,000,000 - $7,500,000',
    property_title: 'Downtown Federal Building',
    is_hot_match: true,
    is_expired: true,
    matchReasons: [
      { text: 'Square Footage', met: true },
      { text: 'Location', met: true },
      { text: 'Budget Match', met: true },
    ],
  },
  {
    id: '2',
    title: 'Department of State Consular Services Office - Rosslyn VA, 75,000 SF',
    agency: 'State',
    agencyDepartment: 'Department of State - Bureau of Consular Affairs',
    solicitation_number: '47PA0025R0089',
    location: 'Arlington, VA',
    match_score: 92,
    deadline: 'Mar 15, 2025',
    estimated_value: '$3,800,000 - $4,500,000',
    property_title: 'Rosslyn Tower',
    is_hot_match: true,
    is_expired: true,
    matchReasons: [
      { text: 'Square Footage', met: true },
      { text: 'Location', met: true },
      { text: 'Public Access', met: true },
    ],
  },
  {
    id: '3',
    title: 'Defense Information Systems Agency Office Lease - Arlington VA',
    agency: 'DOD',
    agencyDepartment: 'Department of Defense - Defense Information Systems Agency',
    solicitation_number: '47PA0025R0034',
    location: 'Arlington, VA',
    match_score: 91,
    deadline: 'Feb 28, 2025',
    estimated_value: '$2,100,000 - $2,800,000',
    property_title: 'Arlington Office Complex',
    is_hot_match: false,
    is_expired: true,
    matchReasons: [
      { text: 'Square Footage', met: true },
      { text: 'Security Requirements', met: true },
      { text: 'Location', met: true },
    ],
  },
];

export default function MatchesScreen() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [matches] = useState(MOCK_MATCHES);

  const toggleExpanded = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const hotMatchCount = matches.filter((m) => m.is_hot_match).length;
  const unreviewed = matches.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            Federal lease opportunities matched to your properties
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{matches.length}</Text>
          <Text style={styles.statLabel}>Total Matches</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMiddle]}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>
            {hotMatchCount}
          </Text>
          <Text style={styles.statLabel}>Hot Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreviewed}</Text>
          <Text style={styles.statLabel}>Unreviewed</Text>
        </View>
      </View>

      {/* Matches List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {matches.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            {/* Badges Row */}
            <View style={styles.badgesRow}>
              {match.is_hot_match && (
                <View style={styles.hotMatchBadge}>
                  <Ionicons name="flame" size={10} color="#FFFFFF" />
                  <Text style={styles.hotMatchText}>HOT MATCH</Text>
                </View>
              )}
              <View style={styles.matchScoreBadge}>
                <Ionicons name="flash" size={10} color="#10B981" />
                <Text style={styles.matchScoreText}>{match.match_score}% Match</Text>
              </View>
              {match.is_expired && (
                <View style={styles.expiredBadge}>
                  <Ionicons name="time-outline" size={10} color="#F59E0B" />
                  <Text style={styles.expiredText}>Expired</Text>
                </View>
              )}
            </View>

            {/* Property Label */}
            <Text style={styles.propertyLabel}>
              FOR: {match.property_title.toUpperCase()}
            </Text>

            {/* Title & Solicitation */}
            <Text style={styles.matchTitle} numberOfLines={2}>
              {match.title}
            </Text>
            <Text style={styles.solicitation}>{match.solicitation_number}</Text>

            {/* Agency */}
            <View style={styles.agencyContainer}>
              <View style={styles.agencyIcon}>
                <Ionicons name="business-outline" size={14} color="#4F46E5" />
              </View>
              <View style={styles.agencyInfo}>
                <Text style={styles.agencyName}>{match.agency}</Text>
                <Text style={styles.agencyDepartment} numberOfLines={1}>
                  {match.agencyDepartment}
                </Text>
              </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{match.location}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Deadline</Text>
                  <Text style={styles.detailValue}>{match.deadline}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Ionicons name="cash-outline" size={12} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Estimated Value</Text>
                <Text style={styles.detailValue}>{match.estimated_value}</Text>
              </View>
            </View>

            {/* Why This Matches */}
            <TouchableOpacity
              style={styles.matchReasonsHeader}
              onPress={() => toggleExpanded(match.id)}
            >
              <Text style={styles.matchReasonsTitle}>WHY THIS MATCHES</Text>
              <View style={styles.seeAllLink}>
                <Text style={styles.seeAllText}>
                  {expandedCard === match.id ? 'Hide' : 'See all details'}
                </Text>
                <Ionicons
                  name={expandedCard === match.id ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#4F46E5"
                />
              </View>
            </TouchableOpacity>

            {expandedCard === match.id && (
              <View style={styles.matchReasonsList}>
                {match.matchReasons.map((reason, index) => (
                  <View key={index} style={styles.matchReasonItem}>
                    <Ionicons
                      name={reason.met ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={reason.met ? '#10B981' : '#EF4444'}
                    />
                    <Text style={styles.matchReasonText}>{reason.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.passButton}>
                <Ionicons name="close" size={14} color="#EF4444" />
                <Text style={styles.passButtonText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton}>
                <Ionicons name="bookmark-outline" size={14} color="#4F46E5" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interestedButton}>
                <Ionicons name="thumbs-up" size={14} color="#FFFFFF" />
                <Text style={styles.interestedButtonText}>Interested</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardMiddle: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  hotMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  hotMatchText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  matchScoreText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#047857',
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  expiredText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#D97706',
  },
  propertyLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  solicitation: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  agencyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  agencyIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  agencyDepartment: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  matchReasonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  matchReasonsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '500',
  },
  matchReasonsList: {
    gap: 6,
    marginBottom: 12,
  },
  matchReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchReasonText: {
    fontSize: 12,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    gap: 4,
  },
  passButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  interestedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#10B981',
    borderRadius: 8,
    gap: 4,
  },
  interestedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
