import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recordsApi } from '@/api';
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  LoadingState,
  EmptyState,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius, lightTheme } from '@/theme';
import { Allergy, Medication, Condition, Vitals } from '@/types';

interface HealthSummary {
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  recentVitals?: Vitals & { date?: string };
  upcomingAppointments: number;
  unreadMessages: number;
}

type Section = 'overview' | 'medications' | 'allergies' | 'conditions' | 'vitals' | 'documents';

export default function RecordsScreen() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const response = await recordsApi.getHealthSummary();
    if (response.success && response.data) {
      setHealthSummary(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const sections: { id: Section; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'overview', icon: 'grid-outline', label: 'Overview' },
    { id: 'medications', icon: 'medical-outline', label: 'Medications' },
    { id: 'allergies', icon: 'alert-circle-outline', label: 'Allergies' },
    { id: 'conditions', icon: 'fitness-outline', label: 'Conditions' },
    { id: 'vitals', icon: 'pulse-outline', label: 'Vitals' },
    { id: 'documents', icon: 'document-outline', label: 'Documents' },
  ];

  const renderOverview = () => (
    <View style={styles.overviewContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card variant="elevated" style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <Ionicons name="medical" size={24} color={colors.primary[600]} />
            <Text style={styles.statNumber}>
              {healthSummary?.medications.filter((m) => m.status === 'ACTIVE').length || 0}
            </Text>
            <Text style={styles.statLabel}>Active Meds</Text>
          </CardContent>
        </Card>
        <Card variant="elevated" style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <Ionicons name="alert-circle" size={24} color={colors.warning[600]} />
            <Text style={styles.statNumber}>
              {healthSummary?.allergies.filter((a) => a.status === 'ACTIVE').length || 0}
            </Text>
            <Text style={styles.statLabel}>Allergies</Text>
          </CardContent>
        </Card>
        <Card variant="elevated" style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <Ionicons name="fitness" size={24} color={colors.info[600]} />
            <Text style={styles.statNumber}>
              {healthSummary?.conditions.filter((c) => c.status === 'ACTIVE').length || 0}
            </Text>
            <Text style={styles.statLabel}>Conditions</Text>
          </CardContent>
        </Card>
      </View>

      {/* Recent Vitals */}
      {healthSummary?.recentVitals && (
        <Card variant="outlined" style={styles.sectionCard}>
          <CardHeader title="Recent Vitals" subtitle="Last recorded" />
          <CardContent>
            <View style={styles.vitalsGrid}>
              {healthSummary.recentVitals.bloodPressureSystolic && (
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Blood Pressure</Text>
                  <Text style={styles.vitalValue}>
                    {healthSummary.recentVitals.bloodPressureSystolic}/
                    {healthSummary.recentVitals.bloodPressureDiastolic}
                  </Text>
                  <Text style={styles.vitalUnit}>mmHg</Text>
                </View>
              )}
              {healthSummary.recentVitals.heartRate && (
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <Text style={styles.vitalValue}>
                    {healthSummary.recentVitals.heartRate}
                  </Text>
                  <Text style={styles.vitalUnit}>bpm</Text>
                </View>
              )}
              {healthSummary.recentVitals.weight && (
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Weight</Text>
                  <Text style={styles.vitalValue}>
                    {healthSummary.recentVitals.weight}
                  </Text>
                  <Text style={styles.vitalUnit}>lbs</Text>
                </View>
              )}
              {healthSummary.recentVitals.temperature && (
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                  <Text style={styles.vitalValue}>
                    {healthSummary.recentVitals.temperature}
                  </Text>
                  <Text style={styles.vitalUnit}>°F</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      )}

      {/* Active Medications Preview */}
      <Card variant="outlined" style={styles.sectionCard}>
        <CardHeader
          title="Active Medications"
          action={
            <TouchableOpacity onPress={() => setActiveSection('medications')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          }
        />
        <CardContent>
          {healthSummary?.medications
            .filter((m) => m.status === 'ACTIVE')
            .slice(0, 3)
            .map((med) => (
              <View key={med.id} style={styles.listItem}>
                <Ionicons name="medical" size={20} color={colors.primary[600]} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{med.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {med.dosage} {med.frequency && `• ${med.frequency}`}
                  </Text>
                </View>
              </View>
            ))}
          {(!healthSummary?.medications || healthSummary.medications.length === 0) && (
            <Text style={styles.emptyText}>No active medications</Text>
          )}
        </CardContent>
      </Card>

      {/* Allergies Preview */}
      <Card variant="outlined" style={styles.sectionCard}>
        <CardHeader
          title="Allergies"
          action={
            <TouchableOpacity onPress={() => setActiveSection('allergies')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          }
        />
        <CardContent>
          {healthSummary?.allergies
            .filter((a) => a.status === 'ACTIVE')
            .slice(0, 3)
            .map((allergy) => (
              <View key={allergy.id} style={styles.listItem}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={
                    allergy.severity === 'SEVERE' || allergy.severity === 'LIFE_THREATENING'
                      ? colors.error[600]
                      : colors.warning[600]
                  }
                />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{allergy.allergen}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {allergy.reaction} • {allergy.severity.toLowerCase()}
                  </Text>
                </View>
              </View>
            ))}
          {(!healthSummary?.allergies || healthSummary.allergies.length === 0) && (
            <Text style={styles.emptyText}>No known allergies</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );

  const renderMedications = () => (
    <View style={styles.listContent}>
      {healthSummary?.medications.map((med) => (
        <Card key={med.id} variant="outlined" style={styles.itemCard}>
          <CardContent style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{med.name}</Text>
              <Badge
                text={med.status}
                variant={med.status === 'ACTIVE' ? 'success' : 'default'}
                size="sm"
              />
            </View>
            <View style={styles.itemDetails}>
              {med.dosage && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dosage:</Text>
                  <Text style={styles.detailValue}>{med.dosage}</Text>
                </View>
              )}
              {med.frequency && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequency:</Text>
                  <Text style={styles.detailValue}>{med.frequency}</Text>
                </View>
              )}
              {med.prescribedBy && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prescribed by:</Text>
                  <Text style={styles.detailValue}>{med.prescribedBy}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      ))}
      {(!healthSummary?.medications || healthSummary.medications.length === 0) && (
        <EmptyState
          icon="medical-outline"
          title="No Medications"
          description="You don't have any medications on record"
        />
      )}
    </View>
  );

  const renderAllergies = () => (
    <View style={styles.listContent}>
      {healthSummary?.allergies.map((allergy) => (
        <Card key={allergy.id} variant="outlined" style={styles.itemCard}>
          <CardContent style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{allergy.allergen}</Text>
              <Badge
                text={allergy.severity}
                variant={
                  allergy.severity === 'SEVERE' || allergy.severity === 'LIFE_THREATENING'
                    ? 'error'
                    : allergy.severity === 'MODERATE'
                    ? 'warning'
                    : 'default'
                }
                size="sm"
              />
            </View>
            {allergy.reaction && (
              <Text style={styles.reactionText}>Reaction: {allergy.reaction}</Text>
            )}
          </CardContent>
        </Card>
      ))}
      {(!healthSummary?.allergies || healthSummary.allergies.length === 0) && (
        <EmptyState
          icon="alert-circle-outline"
          title="No Allergies"
          description="No known allergies on record"
        />
      )}
    </View>
  );

  const renderConditions = () => (
    <View style={styles.listContent}>
      {healthSummary?.conditions.map((condition) => (
        <Card key={condition.id} variant="outlined" style={styles.itemCard}>
          <CardContent style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <View style={styles.conditionInfo}>
                <Text style={styles.itemTitle}>{condition.description}</Text>
                <Text style={styles.codeText}>ICD-10: {condition.code}</Text>
              </View>
              <Badge
                text={condition.status}
                variant={condition.status === 'ACTIVE' ? 'info' : 'default'}
                size="sm"
              />
            </View>
          </CardContent>
        </Card>
      ))}
      {(!healthSummary?.conditions || healthSummary.conditions.length === 0) && (
        <EmptyState
          icon="fitness-outline"
          title="No Conditions"
          description="No conditions on record"
        />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading health records..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
      </View>

      {/* Section Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.tab,
                activeSection === section.id && styles.tabActive,
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons
                name={section.icon}
                size={18}
                color={
                  activeSection === section.id
                    ? colors.primary[600]
                    : colors.gray[500]
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === section.id && styles.tabTextActive,
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'medications' && renderMedications()}
        {activeSection === 'allergies' && renderAllergies()}
        {activeSection === 'conditions' && renderConditions()}
        {activeSection === 'vitals' && (
          <EmptyState
            icon="pulse-outline"
            title="Vitals History"
            description="View your vitals history over time"
          />
        )}
        {activeSection === 'documents' && (
          <EmptyState
            icon="document-outline"
            title="Documents"
            description="Access your medical documents"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tabsContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    gap: spacing[1.5],
  },
  tabActive: {
    backgroundColor: colors.primary[50],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary[600],
  },
  content: {
    flex: 1,
  },
  overviewContent: {
    padding: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    padding: spacing[3],
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  sectionCard: {
    marginBottom: spacing[4],
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  vitalItem: {
    minWidth: '40%',
  },
  vitalLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing[0.5],
  },
  vitalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  vitalUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  listItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  listContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  itemCard: {
    marginBottom: 0,
  },
  itemContent: {
    padding: spacing[4],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    flex: 1,
    marginRight: spacing[2],
  },
  itemDetails: {
    marginTop: spacing[3],
    gap: spacing[1],
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    width: 100,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    flex: 1,
  },
  reactionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing[2],
  },
  conditionInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  codeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing[0.5],
  },
});
