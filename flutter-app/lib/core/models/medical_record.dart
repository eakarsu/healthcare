import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'appointment.dart';

enum RecordType {
  labResult,
  imaging,
  prescription,
  visitNote,
  diagnosis,
  immunization,
  procedure,
  referral,
  allergy,
  vital,
  document,
}

extension RecordTypeExtension on RecordType {
  String get displayName {
    switch (this) {
      case RecordType.labResult:
        return 'Lab Result';
      case RecordType.imaging:
        return 'Imaging';
      case RecordType.prescription:
        return 'Prescription';
      case RecordType.visitNote:
        return 'Visit Note';
      case RecordType.diagnosis:
        return 'Diagnosis';
      case RecordType.immunization:
        return 'Immunization';
      case RecordType.procedure:
        return 'Procedure';
      case RecordType.referral:
        return 'Referral';
      case RecordType.allergy:
        return 'Allergy';
      case RecordType.vital:
        return 'Vital Signs';
      case RecordType.document:
        return 'Document';
    }
  }

  IconData get icon {
    switch (this) {
      case RecordType.labResult:
        return Icons.science_outlined;
      case RecordType.imaging:
        return Icons.image_outlined;
      case RecordType.prescription:
        return Icons.medication_outlined;
      case RecordType.visitNote:
        return Icons.description_outlined;
      case RecordType.diagnosis:
        return Icons.medical_services_outlined;
      case RecordType.immunization:
        return Icons.vaccines_outlined;
      case RecordType.procedure:
        return Icons.healing_outlined;
      case RecordType.referral:
        return Icons.forward_outlined;
      case RecordType.allergy:
        return Icons.warning_amber_outlined;
      case RecordType.vital:
        return Icons.favorite_outline;
      case RecordType.document:
        return Icons.insert_drive_file_outlined;
    }
  }
}

class Attachment extends Equatable {
  final String id;
  final String fileName;
  final String fileType;
  final int fileSize;
  final String url;
  final DateTime uploadedAt;

  const Attachment({
    required this.id,
    required this.fileName,
    required this.fileType,
    required this.fileSize,
    required this.url,
    required this.uploadedAt,
  });

  String get formattedFileSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  bool get isImage => ['jpg', 'jpeg', 'png', 'gif', 'heic']
      .contains(fileType.toLowerCase());

  bool get isPDF => fileType.toLowerCase() == 'pdf';

  factory Attachment.fromJson(Map<String, dynamic> json) {
    return Attachment(
      id: json['id'] as String,
      fileName: json['file_name'] as String,
      fileType: json['file_type'] as String,
      fileSize: json['file_size'] as int,
      url: json['url'] as String,
      uploadedAt: DateTime.parse(json['uploaded_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, fileName, fileType, fileSize, url];
}

class MedicalRecord extends Equatable {
  final String id;
  final String patientId;
  final String? providerId;
  final RecordType recordType;
  final String title;
  final String? description;
  final DateTime date;
  final List<Attachment>? attachments;
  final Map<String, String>? metadata;
  final bool isConfidential;
  final Provider? provider;
  final DateTime createdAt;
  final DateTime updatedAt;

  const MedicalRecord({
    required this.id,
    required this.patientId,
    this.providerId,
    required this.recordType,
    required this.title,
    this.description,
    required this.date,
    this.attachments,
    this.metadata,
    required this.isConfidential,
    this.provider,
    required this.createdAt,
    required this.updatedAt,
  });

  String get formattedDate => DateFormat('MMMM d, yyyy').format(date);

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      providerId: json['provider_id'] as String?,
      recordType: RecordType.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['record_type'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => RecordType.document,
      ),
      title: json['title'] as String,
      description: json['description'] as String?,
      date: DateTime.parse(json['date'] as String),
      attachments: (json['attachments'] as List<dynamic>?)
          ?.map((e) => Attachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      metadata: (json['metadata'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, v.toString()),
      ),
      isConfidential: json['is_confidential'] as bool? ?? false,
      provider: json['provider'] != null
          ? Provider.fromJson(json['provider'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, patientId, recordType, title, date];
}

class VitalSigns extends Equatable {
  final String id;
  final String patientId;
  final DateTime recordedAt;
  final int? bloodPressureSystolic;
  final int? bloodPressureDiastolic;
  final int? heartRate;
  final double? temperature;
  final int? respiratoryRate;
  final int? oxygenSaturation;
  final double? weight;
  final double? height;
  final String? notes;

  const VitalSigns({
    required this.id,
    required this.patientId,
    required this.recordedAt,
    this.bloodPressureSystolic,
    this.bloodPressureDiastolic,
    this.heartRate,
    this.temperature,
    this.respiratoryRate,
    this.oxygenSaturation,
    this.weight,
    this.height,
    this.notes,
  });

  String? get bloodPressure {
    if (bloodPressureSystolic == null || bloodPressureDiastolic == null) {
      return null;
    }
    return '$bloodPressureSystolic/$bloodPressureDiastolic mmHg';
  }

  double? get bmi {
    if (weight == null || height == null || height == 0) return null;
    final heightInMeters = height! / 100;
    return weight! / (heightInMeters * heightInMeters);
  }

  String? get formattedBMI => bmi?.toStringAsFixed(1);

  factory VitalSigns.fromJson(Map<String, dynamic> json) {
    return VitalSigns(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      recordedAt: DateTime.parse(json['recorded_at'] as String),
      bloodPressureSystolic: json['blood_pressure_systolic'] as int?,
      bloodPressureDiastolic: json['blood_pressure_diastolic'] as int?,
      heartRate: json['heart_rate'] as int?,
      temperature: (json['temperature'] as num?)?.toDouble(),
      respiratoryRate: json['respiratory_rate'] as int?,
      oxygenSaturation: json['oxygen_saturation'] as int?,
      weight: (json['weight'] as num?)?.toDouble(),
      height: (json['height'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, patientId, recordedAt];
}

class Medication extends Equatable {
  final String id;
  final String patientId;
  final String? prescriberId;
  final String name;
  final String dosage;
  final String frequency;
  final String? route;
  final DateTime startDate;
  final DateTime? endDate;
  final String? instructions;
  final int? refillsRemaining;
  final bool isActive;
  final Provider? prescriber;

  const Medication({
    required this.id,
    required this.patientId,
    this.prescriberId,
    required this.name,
    required this.dosage,
    required this.frequency,
    this.route,
    required this.startDate,
    this.endDate,
    this.instructions,
    this.refillsRemaining,
    required this.isActive,
    this.prescriber,
  });

  bool get isCurrentlyActive {
    if (!isActive) return false;
    if (endDate != null && endDate!.isBefore(DateTime.now())) return false;
    return true;
  }

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      prescriberId: json['prescriber_id'] as String?,
      name: json['name'] as String,
      dosage: json['dosage'] as String,
      frequency: json['frequency'] as String,
      route: json['route'] as String?,
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'] as String)
          : null,
      instructions: json['instructions'] as String?,
      refillsRemaining: json['refills_remaining'] as int?,
      isActive: json['is_active'] as bool? ?? true,
      prescriber: json['prescriber'] != null
          ? Provider.fromJson(json['prescriber'] as Map<String, dynamic>)
          : null,
    );
  }

  @override
  List<Object?> get props => [id, patientId, name, dosage, isActive];
}

enum AllergySeverity { mild, moderate, severe, lifeThreatening }

extension AllergySeverityExtension on AllergySeverity {
  String get displayName {
    switch (this) {
      case AllergySeverity.mild:
        return 'Mild';
      case AllergySeverity.moderate:
        return 'Moderate';
      case AllergySeverity.severe:
        return 'Severe';
      case AllergySeverity.lifeThreatening:
        return 'Life-threatening';
    }
  }

  Color get color {
    switch (this) {
      case AllergySeverity.mild:
        return Colors.green;
      case AllergySeverity.moderate:
        return Colors.orange;
      case AllergySeverity.severe:
        return Colors.deepOrange;
      case AllergySeverity.lifeThreatening:
        return Colors.red;
    }
  }
}

class Allergy extends Equatable {
  final String id;
  final String patientId;
  final String allergen;
  final String? reaction;
  final AllergySeverity severity;
  final DateTime? onsetDate;
  final String? notes;
  final bool isActive;

  const Allergy({
    required this.id,
    required this.patientId,
    required this.allergen,
    this.reaction,
    required this.severity,
    this.onsetDate,
    this.notes,
    required this.isActive,
  });

  factory Allergy.fromJson(Map<String, dynamic> json) {
    return Allergy(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      allergen: json['allergen'] as String,
      reaction: json['reaction'] as String?,
      severity: AllergySeverity.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['severity'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => AllergySeverity.mild,
      ),
      onsetDate: json['onset_date'] != null
          ? DateTime.parse(json['onset_date'] as String)
          : null,
      notes: json['notes'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  @override
  List<Object?> get props => [id, patientId, allergen, severity];
}
