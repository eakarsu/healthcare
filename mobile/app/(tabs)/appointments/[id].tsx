import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useAppointmentsStore } from '@/store';
import {
  Card,
  CardContent,
  Button,
  LoadingState,
  Avatar,
  AppointmentStatusBadge,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius, lightTheme } from '@/theme';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedAppointment,
    isLoading,
    fetchAppointment,
    cancelAppointment,
    confirmAppointment,
  } = useAppointmentsStore();

  useEffect(() => {
    if (id) {
      fetchAppointment(id);
    }
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    const success = await confirmAppointment(id);
    if (success) {
      Alert.alert('Success', 'Appointment confirmed successfully');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const success = await cancelAppointment(id, 'Cancelled by patient');
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    // Navigate to reschedule screen
    router.push(`/(tabs)/appointments/book?reschedule=${id}`);
  };

  if (isLoading || !selectedAppointment) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading appointment..." fullScreen />
      </SafeAreaView>
    );
  }

  const appointment = selectedAppointment;
  const startTime = parseISO(appointment.startTime);
  const endTime = parseISO(appointment.endTime);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="elevated" style={styles.statusCard}>
          <CardContent style={styles.statusContent}>
            <AppointmentStatusBadge status={appointment.status} />
            <Text style={styles.dateText}>
              {format(startTime, 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={styles.timeText}>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </Text>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card variant="outlined" style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Provider</Text>
            <View style={styles.providerRow}>
              <Avatar
                name={`${appointment.provider.firstName} ${appointment.provider.lastName}`}
                size="lg"
              />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>
                  {appointment.provider.firstName} {appointment.provider.lastName}
                  {appointment.provider.credentials && `, ${appointment.provider.credentials}`}
                </Text>
                <Text style={styles.specialty}>
                  {appointment.provider.specialty}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Appointment Type */}
        <Card variant="outlined" style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Visit Type</Text>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.typeIndicator,
                  { backgroundColor: appointment.appointmentType.color || colors.primary[500] },
                ]}
              />
              <Text style={styles.typeText}>{appointment.appointmentType.name}</Text>
            </View>
            {appointment.telehealth && (
              <View style={styles.telehealthInfo}>
                <Ionicons name="videocam" size={20} color={colors.primary[600]} />
                <Text style={styles.telehealthText}>Telehealth Video Visit</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card variant="outlined" style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={24} color={colors.primary[600]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{appointment.location.name}</Text>
                {appointment.location.address && (
                  <Text style={styles.locationAddress}>
                    {appointment.location.address.street1}
                    {appointment.location.address.street2 &&
                      `, ${appointment.location.address.street2}`}
                    {'\n'}
                    {appointment.location.address.city}, {appointment.location.address.state}{' '}
                    {appointment.location.address.zipCode}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary[600]} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Reason */}
        {appointment.reason && (
          <Card variant="outlined" style={styles.card}>
            <CardContent>
              <Text style={styles.sectionTitle}>Reason for Visit</Text>
              <Text style={styles.reasonText}>{appointment.reason}</Text>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {appointment.notes && (
          <Card variant="outlined" style={styles.card}>
            <CardContent>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {appointment.status === 'SCHEDULED' && (
            <Button
              title="Confirm Appointment"
              onPress={handleConfirm}
              fullWidth
              size="lg"
            />
          )}

          {appointment.telehealth &&
            (appointment.status === 'CONFIRMED' || appointment.status === 'CHECKED_IN') && (
              <Button
                title="Join Video Visit"
                onPress={() => {/* Handle join telehealth */}}
                fullWidth
                size="lg"
                leftIcon={<Ionicons name="videocam" size={20} color={colors.white} />}
              />
            )}

          {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
            <>
              <Button
                title="Reschedule"
                variant="outline"
                onPress={handleReschedule}
                fullWidth
                size="lg"
              />
              <Button
                title="Cancel Appointment"
                variant="ghost"
                onPress={handleCancel}
                fullWidth
                size="lg"
              />
            </>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  statusCard: {
    marginBottom: spacing[4],
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  statusContent: {
    alignItems: 'center',
    padding: spacing[5],
  },
  dateText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing[3],
  },
  timeText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[1],
  },
  card: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  specialty: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
  },
  telehealthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
  },
  telehealthText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  locationAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[1],
    lineHeight: 20,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  directionsText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  reasonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: 22,
  },
  notesText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    lineHeight: 22,
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
});
