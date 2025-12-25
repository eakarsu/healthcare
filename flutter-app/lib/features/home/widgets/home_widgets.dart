import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/common_widgets.dart';

class WelcomeCard extends StatelessWidget {
  final String userName;
  final String? avatarUrl;
  final String initials;

  const WelcomeCard({
    super.key,
    required this.userName,
    this.avatarUrl,
    required this.initials,
  });

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.secondary.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          AvatarWidget(
            imageUrl: avatarUrl,
            initials: initials,
            size: 56,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _greeting,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  userName,
                  style: AppTextStyles.headlineSmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class QuickActionsGrid extends StatelessWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _QuickActionItem(
          icon: Icons.add_circle_outline,
          label: 'Book',
          color: AppColors.primary,
          onTap: () => context.go('/appointments/book'),
        ),
        _QuickActionItem(
          icon: Icons.message_outlined,
          label: 'Message',
          color: AppColors.secondary,
          onTap: () => context.go('/messages'),
        ),
        _QuickActionItem(
          icon: Icons.folder_outlined,
          label: 'Records',
          color: AppColors.accent,
          onTap: () => context.go('/records'),
        ),
        _QuickActionItem(
          icon: Icons.payment_outlined,
          label: 'Pay',
          color: AppColors.success,
          onTap: () {
            // Navigate to payments
          },
        ),
      ],
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class UpcomingAppointmentsList extends StatelessWidget {
  const UpcomingAppointmentsList({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual data from provider
    return Column(
      children: [
        _AppointmentCard(
          type: 'Check-up',
          provider: 'Dr. Sarah Johnson',
          date: 'Dec 28, 2025',
          time: '10:00 AM',
          isVirtual: false,
        ),
        const SizedBox(height: 12),
        _AppointmentCard(
          type: 'Follow-up',
          provider: 'Dr. Michael Chen',
          date: 'Jan 3, 2026',
          time: '2:30 PM',
          isVirtual: true,
        ),
      ],
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final String type;
  final String provider;
  final String date;
  final String time;
  final bool isVirtual;

  const _AppointmentCard({
    required this.type,
    required this.provider,
    required this.date,
    required this.time,
    required this.isVirtual,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
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
            child: Icon(
              isVirtual ? Icons.videocam_outlined : Icons.medical_services_outlined,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(type, style: AppTextStyles.titleSmall),
                    if (isVirtual) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Virtual',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  provider,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 14,
                      color: AppColors.textTertiary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      date,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Icon(
                      Icons.access_time,
                      size: 14,
                      color: AppColors.textTertiary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      time,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right,
            color: AppColors.textTertiary,
          ),
        ],
      ),
    );
  }
}

class RecentMessagesList extends StatelessWidget {
  const RecentMessagesList({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual data from provider
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          _MessageItem(
            senderName: 'Dr. Sarah Johnson',
            message: 'Your lab results are ready. Please review them...',
            time: '2h ago',
            unread: true,
          ),
          const Divider(),
          _MessageItem(
            senderName: 'Billing Department',
            message: 'Your payment has been processed successfully.',
            time: '1d ago',
            unread: false,
          ),
        ],
      ),
    );
  }
}

class _MessageItem extends StatelessWidget {
  final String senderName;
  final String message;
  final String time;
  final bool unread;

  const _MessageItem({
    required this.senderName,
    required this.message,
    required this.time,
    required this.unread,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          AvatarWidget(
            initials: senderName.split(' ').map((e) => e[0]).take(2).join(),
            size: 40,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        senderName,
                        style: AppTextStyles.titleSmall.copyWith(
                          fontWeight: unread ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                    ),
                    Text(
                      time,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  message,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (unread)
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(left: 8),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}

class HealthSummaryCard extends StatelessWidget {
  const HealthSummaryCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: const [
          _VitalItem(
            icon: Icons.favorite,
            value: '72',
            unit: 'bpm',
            label: 'Heart Rate',
            color: Colors.red,
          ),
          _VitalItem(
            icon: Icons.water_drop,
            value: '120/80',
            unit: '',
            label: 'Blood Pressure',
            color: Colors.blue,
          ),
          _VitalItem(
            icon: Icons.monitor_weight,
            value: '68.5',
            unit: 'kg',
            label: 'Weight',
            color: Colors.green,
          ),
        ],
      ),
    );
  }
}

class _VitalItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String unit;
  final String label;
  final Color color;

  const _VitalItem({
    required this.icon,
    required this.value,
    required this.unit,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(height: 8),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(value, style: AppTextStyles.titleMedium),
            if (unit.isNotEmpty)
              Text(
                unit,
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }
}
