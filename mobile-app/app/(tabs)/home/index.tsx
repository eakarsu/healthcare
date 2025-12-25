import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, CardContent, Avatar, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth';
import { spacing, borderRadius, getShadow } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();

  const quickActions = [
    { icon: 'calendar-outline', label: 'Book', route: '/(tabs)/appointments' },
    { icon: 'document-text-outline', label: 'Records', route: '/(tabs)/records' },
    { icon: 'chatbubble-outline', label: 'Message', route: '/(tabs)/messages' },
    { icon: 'card-outline', label: 'Pay', route: '/(tabs)/payments' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text variant="bodySmall" color={theme.colors.textSecondary}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
            </Text>
            <Text variant="h3">
              {user?.firstName || 'Welcome'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar name={user ? `${user.firstName} ${user.lastName}` : undefined} size="lg" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.quickAction,
                { backgroundColor: theme.colors.surface },
                getShadow('sm'),
              ]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name={action.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <Text variant="caption" color={theme.colors.textSecondary} weight="500">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointment Card */}
        <Card variant="elevated" style={styles.appointmentCard}>
          <CardContent>
            <View style={styles.cardHeader}>
              <Text variant="labelSmall" color={theme.colors.textSecondary}>
                NEXT APPOINTMENT
              </Text>
            </View>
            <View style={styles.appointmentInfo}>
              <View style={[styles.dateBox, { backgroundColor: theme.colors.primaryLight }]}>
                <Text variant="h4" color={theme.colors.primary}>15</Text>
                <Text variant="caption" color={theme.colors.primary}>JAN</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text variant="h5">Annual Checkup</Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  Dr. Sarah Johnson
                </Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  10:30 AM • Main Clinic
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Button title="View Details" variant="outline" size="sm" onPress={() => {}} />
              <Button title="Check In" size="sm" onPress={() => {}} />
            </View>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h5">Health Summary</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
              <Text variant="bodySmall" color={theme.colors.primary} weight="500">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.healthGrid}>
            <Card variant="outlined" style={styles.healthCard}>
              <CardContent style={styles.healthCardContent}>
                <Ionicons name="medical" size={24} color={theme.colors.primary} />
                <Text variant="h4" style={styles.healthValue}>3</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  Active Meds
                </Text>
              </CardContent>
            </Card>

            <Card variant="outlined" style={styles.healthCard}>
              <CardContent style={styles.healthCardContent}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.warning} />
                <Text variant="h4" style={styles.healthValue}>2</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  Allergies
                </Text>
              </CardContent>
            </Card>

            <Card variant="outlined" style={styles.healthCard}>
              <CardContent style={styles.healthCardContent}>
                <Ionicons name="pulse" size={24} color={theme.colors.success} />
                <Text variant="h4" style={styles.healthValue}>120/80</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  Blood Pressure
                </Text>
              </CardContent>
            </Card>

            <Card variant="outlined" style={styles.healthCard}>
              <CardContent style={styles.healthCardContent}>
                <Ionicons name="heart" size={24} color={theme.colors.error} />
                <Text variant="h4" style={styles.healthValue}>72</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  Heart Rate
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Unread Messages */}
        <Card variant="outlined" style={styles.messagesCard}>
          <CardContent>
            <View style={styles.messagesHeader}>
              <View style={styles.messagesTitle}>
                <Ionicons name="chatbubbles" size={20} color={theme.colors.primary} />
                <Text variant="label">Unread Messages</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text variant="caption" color={theme.colors.onPrimary} weight="600">
                  2
                </Text>
              </View>
            </View>
            <Button
              title="View Messages"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/(tabs)/messages')}
              style={styles.viewMessagesBtn}
            />
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  greeting: {
    gap: spacing[0.5],
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    gap: spacing[2],
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentCard: {
    marginBottom: spacing[6],
  },
  cardHeader: {
    marginBottom: spacing[3],
  },
  appointmentInfo: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDetails: {
    flex: 1,
    gap: spacing[0.5],
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  healthCard: {
    width: '47%',
  },
  healthCardContent: {
    alignItems: 'center',
    gap: spacing[1],
  },
  healthValue: {
    marginTop: spacing[1],
  },
  messagesCard: {
    marginBottom: spacing[6],
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagesTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  viewMessagesBtn: {
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
});
