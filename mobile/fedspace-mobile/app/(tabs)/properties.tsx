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

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  total_sf: number;
  available_sf: number;
  match_count: number;
  best_match_score: number;
  views: number;
  status: 'active' | 'pending';
}

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Downtown Federal Building',
    address: '1500 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    total_sf: 125000,
    available_sf: 125000,
    match_count: 45,
    best_match_score: 94,
    views: 245,
    status: 'active',
  },
  {
    id: '2',
    title: 'Rosslyn Tower',
    address: '1812 North Moore Street',
    city: 'Arlington',
    state: 'VA',
    total_sf: 150000,
    available_sf: 75000,
    match_count: 38,
    best_match_score: 92,
    views: 312,
    status: 'active',
  },
  {
    id: '3',
    title: 'Arlington Office Complex',
    address: '2200 Wilson Boulevard',
    city: 'Arlington',
    state: 'VA',
    total_sf: 85000,
    available_sf: 42000,
    match_count: 32,
    best_match_score: 91,
    views: 189,
    status: 'active',
  },
  {
    id: '4',
    title: 'Bethesda Medical Office',
    address: '7315 Wisconsin Avenue',
    city: 'Bethesda',
    state: 'MD',
    total_sf: 65000,
    available_sf: 65000,
    match_count: 24,
    best_match_score: 89,
    views: 156,
    status: 'active',
  },
];

export default function PropertiesScreen() {
  const [properties] = useState(MOCK_PROPERTIES);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const totalMatches = properties.reduce((sum, p) => sum + p.match_count, 0);
  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const avgMatchScore = Math.round(
    properties.reduce((sum, p) => sum + p.best_match_score, 0) /
      properties.length
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Properties</Text>
          <Text style={styles.headerSubtitle}>{properties.length} active listings</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="flash-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.summaryNumber}>{totalMatches}</Text>
            <Text style={styles.summaryLabel}>Total Matches</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.summaryNumber}>{avgMatchScore}%</Text>
            <Text style={styles.summaryLabel}>Avg Score</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="eye-outline" size={20} color="#6B7280" />
            </View>
            <Text style={styles.summaryNumber}>{totalViews}</Text>
            <Text style={styles.summaryLabel}>Total Views</Text>
          </View>
        </View>

        {/* Properties List */}
        <View style={styles.propertiesList}>
          {properties.map((property) => (
            <TouchableOpacity key={property.id} style={styles.propertyCard}>
              {/* Header */}
              <View style={styles.propertyHeader}>
                <View style={styles.propertyIcon}>
                  <Ionicons name="business-outline" size={18} color="#4F46E5" />
                </View>
                <View style={styles.propertyHeaderInfo}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      property.status === 'active'
                        ? styles.statusActive
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        property.status === 'active'
                          ? styles.statusActiveText
                          : styles.statusPendingText,
                      ]}
                    >
                      {property.status === 'active' ? 'Active' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {property.address}, {property.city}, {property.state}
                </Text>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Available SF</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(property.available_sf)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Matches</Text>
                  <Text style={styles.statValue}>{property.match_count}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Match</Text>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>
                    {property.best_match_score}%
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.propertyFooter}>
                <View style={styles.viewsInfo}>
                  <Ionicons name="eye-outline" size={14} color="#6B7280" />
                  <Text style={styles.viewsText}>{property.views} views</Text>
                </View>
                <View style={styles.viewMatchesLink}>
                  <Text style={styles.viewMatchesText}>View Matches</Text>
                  <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  propertiesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  propertyIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#059669',
  },
  statusPendingText: {
    color: '#D97706',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewMatchesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMatchesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
