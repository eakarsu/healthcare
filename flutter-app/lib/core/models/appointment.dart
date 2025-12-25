import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../theme/app_colors.dart';

enum AppointmentType {
  checkup,
  followUp,
  consultation,
  procedure,
  labWork,
  imaging,
  vaccination,
  emergency,
  telehealth,
}

enum AppointmentStatus {
  scheduled,
  confirmed,
  checkedIn,
  inProgress,
  completed,
  cancelled,
  noShow,
  rescheduled,
}

extension AppointmentTypeExtension on AppointmentType {
  String get displayName {
    switch (this) {
      case AppointmentType.checkup:
        return 'Check-up';
      case AppointmentType.followUp:
        return 'Follow-up';
      case AppointmentType.consultation:
        return 'Consultation';
      case AppointmentType.procedure:
        return 'Procedure';
      case AppointmentType.labWork:
        return 'Lab Work';
      case AppointmentType.imaging:
        return 'Imaging';
      case AppointmentType.vaccination:
        return 'Vaccination';
      case AppointmentType.emergency:
        return 'Emergency';
      case AppointmentType.telehealth:
        return 'Telehealth';
    }
  }

  IconData get icon {
    switch (this) {
      case AppointmentType.checkup:
        return Icons.medical_services_outlined;
      case AppointmentType.followUp:
        return Icons.replay;
      case AppointmentType.consultation:
        return Icons.people_outline;
      case AppointmentType.procedure:
        return Icons.healing_outlined;
      case AppointmentType.labWork:
        return Icons.science_outlined;
      case AppointmentType.imaging:
        return Icons.camera_alt_outlined;
      case AppointmentType.vaccination:
        return Icons.vaccines_outlined;
      case AppointmentType.emergency:
        return Icons.emergency_outlined;
      case AppointmentType.telehealth:
        return Icons.videocam_outlined;
    }
  }
}

extension AppointmentStatusExtension on AppointmentStatus {
  String get displayName {
    switch (this) {
      case AppointmentStatus.scheduled:
        return 'Scheduled';
      case AppointmentStatus.confirmed:
        return 'Confirmed';
      case AppointmentStatus.checkedIn:
        return 'Checked In';
      case AppointmentStatus.inProgress:
        return 'In Progress';
      case AppointmentStatus.completed:
        return 'Completed';
      case AppointmentStatus.cancelled:
        return 'Cancelled';
      case AppointmentStatus.noShow:
        return 'No Show';
      case AppointmentStatus.rescheduled:
        return 'Rescheduled';
    }
  }

  Color get color {
    switch (this) {
      case AppointmentStatus.scheduled:
        return AppColors.statusScheduled;
      case AppointmentStatus.confirmed:
        return AppColors.statusConfirmed;
      case AppointmentStatus.checkedIn:
        return AppColors.statusCheckedIn;
      case AppointmentStatus.inProgress:
        return AppColors.statusInProgress;
      case AppointmentStatus.completed:
        return AppColors.statusCompleted;
      case AppointmentStatus.cancelled:
      case AppointmentStatus.noShow:
        return AppColors.statusCancelled;
      case AppointmentStatus.rescheduled:
        return AppColors.warning;
    }
  }
}

class Provider extends Equatable {
  final String id;
  final String userId;
  final String specialty;
  final String? licenseNumber;
  final String? npi;
  final String? firstName;
  final String? lastName;

  const Provider({
    required this.id,
    required this.userId,
    required this.specialty,
    this.licenseNumber,
    this.npi,
    this.firstName,
    this.lastName,
  });

  String get displayName {
    if (firstName != null && lastName != null) {
      return 'Dr. $firstName $lastName';
    }
    return 'Provider';
  }

  factory Provider.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return Provider(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      specialty: json['specialty'] as String,
      licenseNumber: json['license_number'] as String?,
      npi: json['npi'] as String?,
      firstName: user?['first_name'] as String?,
      lastName: user?['last_name'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, userId, specialty, licenseNumber, npi];
}

class Location extends Equatable {
  final String id;
  final String name;
  final String address;
  final String city;
  final String state;
  final String zipCode;
  final String? phone;
  final bool isActive;

  const Location({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.zipCode,
    this.phone,
    required this.isActive,
  });

  String get fullAddress => '$address, $city, $state $zipCode';

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      zipCode: json['zip_code'] as String,
      phone: json['phone'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  @override
  List<Object?> get props => [id, name, address, city, state, zipCode];
}

class Appointment extends Equatable {
  final String id;
  final String patientId;
  final String providerId;
  final String? locationId;
  final AppointmentType appointmentType;
  final AppointmentStatus status;
  final DateTime startTime;
  final DateTime endTime;
  final String? notes;
  final String? reason;
  final bool isVirtual;
  final String? virtualMeetingUrl;
  final Provider? provider;
  final Location? location;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Appointment({
    required this.id,
    required this.patientId,
    required this.providerId,
    this.locationId,
    required this.appointmentType,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.notes,
    this.reason,
    required this.isVirtual,
    this.virtualMeetingUrl,
    this.provider,
    this.location,
    required this.createdAt,
    required this.updatedAt,
  });

  Duration get duration => endTime.difference(startTime);
  int get durationMinutes => duration.inMinutes;
  bool get isUpcoming => startTime.isAfter(DateTime.now());
  bool get isPast => endTime.isBefore(DateTime.now());

  String get formattedDate => DateFormat('MMM d, yyyy').format(startTime);
  String get formattedTime =>
      '${DateFormat('h:mm a').format(startTime)} - ${DateFormat('h:mm a').format(endTime)}';

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      providerId: json['provider_id'] as String,
      locationId: json['location_id'] as String?,
      appointmentType: AppointmentType.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['appointment_type'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => AppointmentType.checkup,
      ),
      status: AppointmentStatus.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['status'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => AppointmentStatus.scheduled,
      ),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      notes: json['notes'] as String?,
      reason: json['reason'] as String?,
      isVirtual: json['is_virtual'] as bool? ?? false,
      virtualMeetingUrl: json['virtual_meeting_url'] as String?,
      provider: json['provider'] != null
          ? Provider.fromJson(json['provider'] as Map<String, dynamic>)
          : null,
      location: json['location'] != null
          ? Location.fromJson(json['location'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patient_id': patientId,
      'provider_id': providerId,
      'location_id': locationId,
      'appointment_type': appointmentType.name.toUpperCase(),
      'status': status.name.toUpperCase(),
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'notes': notes,
      'reason': reason,
      'is_virtual': isVirtual,
      'virtual_meeting_url': virtualMeetingUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        patientId,
        providerId,
        locationId,
        appointmentType,
        status,
        startTime,
        endTime,
        isVirtual,
      ];
}
