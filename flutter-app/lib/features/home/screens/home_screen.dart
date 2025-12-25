import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/common_widgets.dart';
import '../widgets/home_widgets.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications_outlined),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () {
              // Navigate to notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Refresh data
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              WelcomeCard(
                userName: user?.firstName ?? 'User',
                avatarUrl: user?.avatarUrl,
                initials: user?.initials ?? 'U',
              ),
              const SizedBox(height: 24),

              // Quick Actions
              const SectionHeader(title: 'Quick Actions'),
              const SizedBox(height: 12),
              const QuickActionsGrid(),
              const SizedBox(height: 24),

              // Upcoming Appointments
              SectionHeader(
                title: 'Upcoming Appointments',
                actionText: 'See All',
                onAction: () => context.go('/appointments'),
              ),
              const SizedBox(height: 12),
              const UpcomingAppointmentsList(),
              const SizedBox(height: 24),

              // Recent Messages
              SectionHeader(
                title: 'Recent Messages',
                actionText: 'See All',
                onAction: () => context.go('/messages'),
              ),
              const SizedBox(height: 12),
              const RecentMessagesList(),
              const SizedBox(height: 24),

              // Health Summary
              const SectionHeader(title: 'Health Summary'),
              const SizedBox(height: 12),
              const HealthSummaryCard(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
