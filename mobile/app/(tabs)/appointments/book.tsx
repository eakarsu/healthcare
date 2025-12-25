import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfDay } from 'date-fns';
import { useAppointmentsStore } from '@/store';
import {
  Card,
  CardContent,
  Button,
  LoadingState,
  Avatar,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/theme';

const AVAILABLE_TIMES = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
];

export default function BookAppointmentScreen() {
  const {
    appointmentTypes,
    providers,
    locations,
    isLoading,
    fetchAppointmentTypes,
    fetchProviders,
    fetchLocations,
    bookAppointment,
  } = useAppointmentsStore();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAppointmentTypes();
    fetchProviders();
    fetchLocations();
  }, []);

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i + 1);
    return date;
  });

  const handleBook = async () => {
    if (!selectedType || !selectedProvider || !selectedLocation || !selectedDate || !selectedTime) {
      return;
    }

    setIsBooking(true);
    const success = await bookAppointment(
      selectedProvider,
      selectedLocation,
      selectedType,
      format(selectedDate, 'yyyy-MM-dd'),
      selectedTime,
      reason
    );
    setIsBooking(false);

    if (success) {
      router.replace('/(tabs)/appointments');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Appointment Type</Text>
      <Text style={styles.stepDescription}>
        Choose the type of visit you'd like to schedule
      </Text>
      <View style={styles.optionsGrid}>
        {appointmentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              selectedType === type.id && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <View
              style={[
                styles.optionIndicator,
                { backgroundColor: type.color || colors.primary[500] },
              ]}
            />
            <Text style={styles.optionTitle}>{type.name}</Text>
            <Text style={styles.optionDuration}>{type.duration} min</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Provider</Text>
      <Text style={styles.stepDescription}>
        Choose a healthcare provider for your visit
      </Text>
      <View style={styles.providerList}>
        {providers.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              selectedProvider === provider.id && styles.providerCardSelected,
            ]}
            onPress={() => setSelectedProvider(provider.id)}
          >
            <Avatar
              name={`${provider.firstName} ${provider.lastName}`}
              size="md"
            />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>
                {provider.firstName} {provider.lastName}
                {provider.credentials && `, ${provider.credentials}`}
              </Text>
              <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
            </View>
            {selectedProvider === provider.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Location</Text>
      <Text style={styles.stepDescription}>
        Choose a location for your visit
      </Text>
      <View style={styles.locationList}>
        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationCard,
              selectedLocation === location.id && styles.locationCardSelected,
            ]}
            onPress={() => setSelectedLocation(location.id)}
          >
            <Ionicons name="location" size={24} color={colors.primary[600]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              {location.address && (
                <Text style={styles.locationAddress}>
                  {location.address.street1}, {location.address.city}
                </Text>
              )}
            </View>
            {selectedLocation === location.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepDescription}>
        Choose when you'd like to schedule your appointment
      </Text>

      {/* Date Selection */}
      <Text style={styles.subSectionTitle}>Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
      >
        {availableDates.map((date) => (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dateCard,
              selectedDate?.toDateString() === date.toDateString() &&
                styles.dateCardSelected,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateDayName,
                selectedDate?.toDateString() === date.toDateString() &&
                  styles.dateTextSelected,
              ]}
            >
              {format(date, 'EEE')}
            </Text>
            <Text
              style={[
                styles.dateDay,
                selectedDate?.toDateString() === date.toDateString() &&
                  styles.dateTextSelected,
              ]}
            >
              {format(date, 'd')}
            </Text>
            <Text
              style={[
                styles.dateMonth,
                selectedDate?.toDateString() === date.toDateString() &&
                  styles.dateTextSelected,
              ]}
            >
              {format(date, 'MMM')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Selection */}
      <Text style={styles.subSectionTitle}>Time</Text>
      <View style={styles.timeGrid}>
        {AVAILABLE_TIMES.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && styles.timeSlotSelected,
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === time && styles.timeTextSelected,
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Reason for Visit</Text>
      <Text style={styles.stepDescription}>
        Briefly describe why you're scheduling this appointment
      </Text>
      <TextInput
        style={styles.reasonInput}
        placeholder="Enter reason for visit (optional)"
        placeholderTextColor={colors.gray[400]}
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedType;
      case 2:
        return !!selectedProvider;
      case 3:
        return !!selectedLocation;
      case 4:
        return !!selectedDate && !!selectedTime;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (isLoading && appointmentTypes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s <= step && styles.progressDotActive,
              s === step && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <Button
            title="Back"
            variant="outline"
            onPress={() => setStep(step - 1)}
            style={styles.footerButton}
          />
        )}
        <Button
          title={step === 5 ? 'Book Appointment' : 'Continue'}
          onPress={step === 5 ? handleBook : () => setStep(step + 1)}
          disabled={!canProceed()}
          loading={isBooking}
          style={[styles.footerButton, step === 1 && styles.fullButton]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
  },
  progressDotActive: {
    backgroundColor: colors.primary[200],
  },
  progressDotCurrent: {
    backgroundColor: colors.primary[600],
    width: 24,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: spacing[6],
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[2],
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    marginBottom: spacing[6],
  },
  optionsGrid: {
    gap: spacing[3],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray[200],
    gap: spacing[3],
  },
  optionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  optionDuration: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  providerList: {
    gap: spacing[3],
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray[200],
    gap: spacing[3],
  },
  providerCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  providerSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  locationList: {
    gap: spacing[3],
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray[200],
    gap: spacing[3],
  },
  locationCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  locationAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  subSectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  dateScroll: {
    marginBottom: spacing[6],
  },
  dateCard: {
    width: 64,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray[200],
    marginRight: spacing[2],
  },
  dateCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[600],
  },
  dateDayName: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing[1],
  },
  dateDay: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  dateMonth: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  dateTextSelected: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  timeSlot: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  timeSlotSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[600],
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  timeTextSelected: {
    color: colors.white,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  footerButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
  },
});
