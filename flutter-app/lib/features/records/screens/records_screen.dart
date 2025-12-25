import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/medical_record.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/common_widgets.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';

enum RecordCategory { all, labs, imaging, visits, medications }

class RecordsScreen extends ConsumerStatefulWidget {
  const RecordsScreen({super.key});

  @override
  ConsumerState<RecordsScreen> createState() => _RecordsScreenState();
}

class _RecordsScreenState extends ConsumerState<RecordsScreen> {
  RecordCategory _selectedCategory = RecordCategory.all;
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medical Records'),
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: SearchTextField(
              controller: _searchController,
              hint: 'Search records...',
              onChanged: (value) {
                setState(() {});
              },
            ),
          ),

          // Category filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: RecordCategory.values.map((category) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChipButton(
                    text: _getCategoryName(category),
                    isSelected: _selectedCategory == category,
                    onPressed: () {
                      setState(() {
                        _selectedCategory = category;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // Records list
          Expanded(
            child: _buildRecordsList(),
          ),
        ],
      ),
    );
  }

  String _getCategoryName(RecordCategory category) {
    switch (category) {
      case RecordCategory.all:
        return 'All';
      case RecordCategory.labs:
        return 'Labs';
      case RecordCategory.imaging:
        return 'Imaging';
      case RecordCategory.visits:
        return 'Visits';
      case RecordCategory.medications:
        return 'Medications';
    }
  }

  Widget _buildRecordsList() {
    // TODO: Replace with actual data from provider
    final hasRecords = true;

    if (!hasRecords) {
      return const EmptyStateWidget(
        icon: Icons.folder_outlined,
        title: 'No Records Found',
        message: 'Your medical records will appear here',
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh records
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: 10,
        itemBuilder: (context, index) {
          final recordType = RecordType.values[index % RecordType.values.length];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _RecordCard(
              type: recordType,
              title: _getRecordTitle(recordType, index),
              date: 'Dec ${20 - index}, 2025',
              provider: index % 2 == 0 ? 'Dr. Sarah Johnson' : null,
              onTap: () {
                // Navigate to record detail
              },
            ),
          );
        },
      ),
    );
  }

  String _getRecordTitle(RecordType type, int index) {
    switch (type) {
      case RecordType.labResult:
        return 'Complete Blood Count (CBC)';
      case RecordType.imaging:
        return 'Chest X-Ray';
      case RecordType.prescription:
        return 'Prescription - Amoxicillin';
      case RecordType.visitNote:
        return 'Annual Physical Exam';
      case RecordType.diagnosis:
        return 'Upper Respiratory Infection';
      case RecordType.immunization:
        return 'Flu Vaccine';
      case RecordType.procedure:
        return 'ECG';
      default:
        return 'Medical Record $index';
    }
  }
}

class _RecordCard extends StatelessWidget {
  final RecordType type;
  final String title;
  final String date;
  final String? provider;
  final VoidCallback onTap;

  const _RecordCard({
    required this.type,
    required this.title,
    required this.date,
    this.provider,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).cardColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(type.icon, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.titleSmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        StatusBadge(
                          text: type.displayName,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          date,
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                    if (provider != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        provider!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
