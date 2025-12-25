import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/models/appointment.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/custom_button.dart';

class BookAppointmentScreen extends ConsumerStatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  ConsumerState<BookAppointmentScreen> createState() =>
      _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends ConsumerState<BookAppointmentScreen> {
  AppointmentType _selectedType = AppointmentType.checkup;
  String? _selectedProviderId;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay? _selectedTime;
  bool _isVirtual = false;
  final _reasonController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appointment Type
            Text('Appointment Type', style: AppTextStyles.titleSmall),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppointmentType.values.map((type) {
                final isSelected = _selectedType == type;
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        type.icon,
                        size: 18,
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 6),
                      Text(type.displayName),
                    ],
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedType = type;
                      });
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Provider Selection
            Text('Select Provider', style: AppTextStyles.titleSmall),
            const SizedBox(height: 12),
            _buildProviderSelection(),

            const SizedBox(height: 24),

            // Date Selection
            Text('Select Date', style: AppTextStyles.titleSmall),
            const SizedBox(height: 12),
            _buildDatePicker(),

            const SizedBox(height: 24),

            // Time Selection
            if (_selectedProviderId != null) ...[
              Text('Select Time', style: AppTextStyles.titleSmall),
              const SizedBox(height: 12),
              _buildTimeSlots(),
              const SizedBox(height: 24),
            ],

            // Virtual Visit Toggle
            SwitchListTile(
              title: const Text('Virtual Visit'),
              subtitle: const Text('Join via video call instead of in-person'),
              value: _isVirtual,
              onChanged: (value) {
                setState(() {
                  _isVirtual = value;
                });
              },
              contentPadding: EdgeInsets.zero,
            ),

            const SizedBox(height: 16),

            // Reason
            Text('Reason for Visit (Optional)', style: AppTextStyles.titleSmall),
            const SizedBox(height: 12),
            TextField(
              controller: _reasonController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Describe the reason for your visit...',
              ),
            ),

            const SizedBox(height: 32),

            // Book Button
            CustomButton(
              text: 'Book Appointment',
              onPressed: _canBook ? _bookAppointment : null,
              isDisabled: !_canBook,
            ),
          ],
        ),
      ),
    );
  }

  bool get _canBook =>
      _selectedProviderId != null && _selectedTime != null;

  Widget _buildProviderSelection() {
    // TODO: Replace with actual provider data
    final providers = [
      {'id': '1', 'name': 'Dr. Sarah Johnson', 'specialty': 'Internal Medicine'},
      {'id': '2', 'name': 'Dr. Michael Chen', 'specialty': 'Family Medicine'},
      {'id': '3', 'name': 'Dr. Emily Davis', 'specialty': 'Cardiology'},
    ];

    return Column(
      children: providers.map((provider) {
        final isSelected = _selectedProviderId == provider['id'];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: Text(
                provider['name']!.split(' ').map((e) => e[0]).take(2).join(),
                style: TextStyle(color: AppColors.primary),
              ),
            ),
            title: Text(provider['name']!),
            subtitle: Text(provider['specialty']!),
            trailing: isSelected
                ? const Icon(Icons.check_circle, color: AppColors.primary)
                : null,
            onTap: () {
              setState(() {
                _selectedProviderId = provider['id'];
              });
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: _selectedDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 90)),
        );
        if (date != null) {
          setState(() {
            _selectedDate = date;
            _selectedTime = null; // Reset time when date changes
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: AppColors.primary),
            const SizedBox(width: 12),
            Text(
              DateFormat('EEEE, MMMM d, yyyy').format(_selectedDate),
              style: AppTextStyles.bodyLarge,
            ),
            const Spacer(),
            const Icon(Icons.chevron_right, color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeSlots() {
    // TODO: Replace with actual available slots from API
    final slots = [
      TimeOfDay(hour: 9, minute: 0),
      TimeOfDay(hour: 9, minute: 30),
      TimeOfDay(hour: 10, minute: 0),
      TimeOfDay(hour: 10, minute: 30),
      TimeOfDay(hour: 11, minute: 0),
      TimeOfDay(hour: 14, minute: 0),
      TimeOfDay(hour: 14, minute: 30),
      TimeOfDay(hour: 15, minute: 0),
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: slots.map((time) {
        final isSelected = _selectedTime == time;
        return ChoiceChip(
          label: Text(_formatTime(time)),
          selected: isSelected,
          onSelected: (selected) {
            if (selected) {
              setState(() {
                _selectedTime = time;
              });
            }
          },
        );
      }).toList(),
    );
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '$hour:$minute $period';
  }

  Future<void> _bookAppointment() async {
    // TODO: Implement booking logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Appointment booked successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
    context.go('/appointments');
  }
}
