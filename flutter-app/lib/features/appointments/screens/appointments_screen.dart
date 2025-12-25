import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/common_widgets.dart';
import '../../common/widgets/custom_button.dart';
import '../widgets/appointment_card.dart';

enum AppointmentFilter { upcoming, past, all }

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen> {
  AppointmentFilter _selectedFilter = AppointmentFilter.upcoming;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/appointments/book'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: AppointmentFilter.values.map((filter) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChipButton(
                    text: filter.name[0].toUpperCase() + filter.name.substring(1),
                    isSelected: _selectedFilter == filter,
                    onPressed: () {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Appointments list
          Expanded(
            child: _buildAppointmentsList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/appointments/book'),
        icon: const Icon(Icons.add),
        label: const Text('Book'),
      ),
    );
  }

  Widget _buildAppointmentsList() {
    // TODO: Replace with actual data from provider
    final hasAppointments = true;

    if (!hasAppointments) {
      return EmptyStateWidget(
        icon: Icons.calendar_today_outlined,
        title: 'No Appointments',
        message: 'Schedule your next visit with your healthcare provider',
        actionText: 'Book Appointment',
        onAction: () => context.go('/appointments/book'),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh appointments
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: AppointmentCard(
              type: index % 2 == 0 ? 'Check-up' : 'Follow-up',
              status: index == 0 ? 'Confirmed' : 'Scheduled',
              providerName: 'Dr. Sarah Johnson',
              specialty: 'Internal Medicine',
              date: 'Dec ${28 + index}, 2025',
              time: '10:00 AM - 10:30 AM',
              isVirtual: index % 3 == 0,
              onTap: () {
                // Navigate to appointment detail
              },
              onReschedule: () {
                // Handle reschedule
              },
              onCancel: () {
                // Handle cancel
              },
            ),
          );
        },
      ),
    );
  }
}
