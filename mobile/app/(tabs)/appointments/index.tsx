import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { useAppointmentsStore } from '@/store';
import {
  Card,
  CardContent,
  Button,
  EmptyState,
  LoadingState,
  Avatar,
  AppointmentStatusBadge,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius, lightTheme } from '@/theme';
import { Appointment } from '@/types';

export default function AppointmentsScreen() {
  const {
    upcomingAppointments,
    isLoading,
    error,
    fetchUpcomingAppointments,
  } = useAppointmentsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUpcomingAppointments();
    setRefreshing(false);
  }, []);

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d, yyyy');
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/(tabs)/appointments/${appointment.id}`);
  };

  const handleBookAppointment = () => {
    router.push('/(tabs)/appointments/book');
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const startTime = parseISO(item.startTime);
    const dateLabel = getDateLabel(item.startTime);

    return (
      <Card
        variant="elevated"
        style={styles.appointmentCard}
        onPress={() => handleAppointmentPress(item)}
      >
        <CardContent style={styles.appointmentContent}>
          <View style={styles.appointmentHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              <Text style={styles.timeText}>{format(startTime, 'h:mm a')}</Text>
            </View>
            <AppointmentStatusBadge status={item.status} />
          </View>

          <View style={styles.appointmentBody}>
            <View style={styles.providerInfo}>
              <Avatar
                name={`${item.provider.firstName} ${item.provider.lastName}`}
                size="md"
              />
              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>
                  {item.provider.firstName} {item.provider.lastName}
                  {item.provider.credentials && `, ${item.provider.credentials}`}
                </Text>
                <Text style={styles.specialty}>
                  {item.provider.specialty || item.appointmentType.name}
                </Text>
              </View>
            </View>

            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color={colors.gray[400]} />
              <Text style={styles.locationText}>{item.location.name}</Text>
            </View>

            {item.telehealth && (
              <View style={styles.telehealthBadge}>
                <Ionicons name="videocam-outline" size={16} color={colors.primary[600]} />
                <Text style={styles.telehealthText}>Telehealth Visit</Text>
              </View>
            )}
          </View>

          <View style={styles.appointmentFooter}>
            {item.status === 'SCHEDULED' && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary[600]} />
                <Text style={styles.actionText}>Confirm</Text>
              </TouchableOpacity>
            )}
            {item.telehealth && item.status === 'CONFIRMED' && (
              <TouchableOpacity style={[styles.actionButton, styles.joinButton]}>
                <Ionicons name="videocam" size={18} color={colors.white} />
                <Text style={styles.joinText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && upcomingAppointments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading appointments..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>
            {upcomingAppointments.length} upcoming
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleBookAppointment}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={upcomingAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No Upcoming Appointments"
            description="You don't have any appointments scheduled. Book one now to get started."
            actionLabel="Book Appointment"
            onAction={handleBookAppointment}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...lightTheme.shadows.md,
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  appointmentCard: {
    marginBottom: spacing[3],
  },
  appointmentContent: {
    padding: spacing[4],
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[0.5],
  },
  appointmentBody: {
    gap: spacing[3],
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  specialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  telehealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    gap: spacing[1.5],
    alignSelf: 'flex-start',
  },
  telehealthText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  appointmentFooter: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  joinButton: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  joinText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});
