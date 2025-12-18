import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Opportunity {
  id: string;
  title: string;
  agency: string;
  deadline: string;
}

const PIPELINE_STAGES = [
  { id: 'new', title: 'New', count: 6, color: '#4F46E5' },
  { id: 'interested', title: 'Interested', count: 5, color: '#10B981' },
  { id: 'proposal', title: 'Preparing', count: 3, color: '#F59E0B' },
  { id: 'submitted', title: 'Submitted', count: 2, color: '#8B5CF6' },
  { id: 'won', title: 'Won', count: 2, color: '#059669' },
];

const MOCK_OPPORTUNITIES: Record<string, Opportunity[]> = {
  new: [
    { id: '1', title: 'GSA Lease - Office Space in DC', agency: 'GSA', deadline: 'Feb 15' },
    { id: '2', title: 'State Dept Consular Office', agency: 'State', deadline: 'Mar 1' },
  ],
  interested: [
    { id: '3', title: 'DOD DISA Office Lease', agency: 'DOD', deadline: 'Feb 28' },
  ],
  proposal: [
    { id: '4', title: 'NIH Medical Research Facility', agency: 'HHS', deadline: 'Mar 10' },
  ],
  submitted: [
    { id: '5', title: 'VA Healthcare Center', agency: 'VA', deadline: 'Mar 20' },
  ],
  won: [
    { id: '6', title: 'DOE Energy Admin Office', agency: 'DOE', deadline: 'Completed' },
  ],
};

export default function PipelineScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pipeline</Text>
          <Text style={styles.headerSubtitle}>Track opportunity progress</Text>
        </View>
      </View>

      {/* Horizontal Scrolling Stages */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pipelineContainer}
      >
        {PIPELINE_STAGES.map((stage, index) => (
          <View key={stage.id} style={styles.stageColumn}>
            {/* Stage Header */}
            <View style={[styles.stageHeader, { backgroundColor: stage.color }]}>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{stage.count}</Text>
              </View>
            </View>

            {/* Opportunities */}
            <View style={styles.opportunitiesContainer}>
              {MOCK_OPPORTUNITIES[stage.id]?.map((opp) => (
                <View key={opp.id} style={styles.opportunityCard}>
                  <Text style={styles.oppTitle} numberOfLines={2}>
                    {opp.title}
                  </Text>
                  <View style={styles.oppFooter}>
                    <View style={styles.agencyTag}>
                      <Text style={styles.agencyText}>{opp.agency}</Text>
                    </View>
                    <View style={styles.deadlineInfo}>
                      <Ionicons name="calendar-outline" size={10} color="#6B7280" />
                      <Text style={styles.deadlineText}>{opp.deadline}</Text>
                    </View>
                  </View>
                </View>
              ))}
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
  pipelineContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  stageColumn: {
    width: 180,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  stageTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  opportunitiesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
    padding: 8,
    gap: 8,
    minHeight: 150,
  },
  opportunityCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  oppTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 16,
  },
  oppFooter: {
    gap: 6,
  },
  agencyTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 10,
    color: '#6B7280',
  },
});
