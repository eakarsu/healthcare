import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/common_widgets.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: ListView(
        children: [
          // Profile Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                AvatarWidget(
                  imageUrl: user?.avatarUrl,
                  initials: user?.initials ?? 'U',
                  size: 72,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.fullName ?? 'User',
                        style: AppTextStyles.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? '',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      StatusBadge(
                        text: user?.role.name.toUpperCase() ?? 'PATIENT',
                        color: AppColors.primary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const Divider(),

          // Account Section
          _buildSectionHeader('Account'),
          _buildListTile(
            context,
            icon: Icons.person_outline,
            title: 'Edit Profile',
            onTap: () {
              // Navigate to edit profile
            },
          ),
          _buildListTile(
            context,
            icon: Icons.lock_outline,
            title: 'Change Password',
            onTap: () {
              // Navigate to change password
            },
          ),
          if (authState.biometricType != BiometricType.none)
            _buildSwitchTile(
              context,
              ref,
              icon: authState.biometricType == BiometricType.face
                  ? Icons.face
                  : Icons.fingerprint,
              title: 'Use ${_getBiometricName(authState.biometricType)}',
              subtitle: 'Quick login with biometrics',
              value: authState.isBiometricEnabled,
              onChanged: (value) async {
                if (value) {
                  await ref.read(authStateProvider.notifier).enableBiometric();
                } else {
                  await ref.read(authStateProvider.notifier).disableBiometric();
                }
              },
            ),

          const Divider(),

          // Preferences Section
          _buildSectionHeader('Preferences'),
          _buildListTile(
            context,
            icon: Icons.palette_outlined,
            title: 'Appearance',
            trailing: _buildThemeModeDropdown(context, ref),
            onTap: null,
          ),
          _buildListTile(
            context,
            icon: Icons.notifications_outlined,
            title: 'Notifications',
            onTap: () {
              // Navigate to notification settings
            },
          ),

          const Divider(),

          // Support Section
          _buildSectionHeader('Support'),
          _buildListTile(
            context,
            icon: Icons.help_outline,
            title: 'Help Center',
            onTap: () {},
          ),
          _buildListTile(
            context,
            icon: Icons.mail_outline,
            title: 'Contact Support',
            onTap: () {},
          ),
          _buildListTile(
            context,
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            onTap: () {},
          ),
          _buildListTile(
            context,
            icon: Icons.description_outlined,
            title: 'Terms of Service',
            onTap: () {},
          ),

          const Divider(),

          // About Section
          _buildSectionHeader('About'),
          _buildListTile(
            context,
            icon: Icons.info_outline,
            title: 'Version',
            trailing: Text(
              '1.0.0 (1)',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            onTap: null,
          ),

          const SizedBox(height: 16),

          // Logout Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Log Out'),
                    content: const Text('Are you sure you want to log out?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.error,
                        ),
                        child: const Text('Log Out'),
                      ),
                    ],
                  ),
                );

                if (confirmed == true) {
                  await ref.read(authStateProvider.notifier).logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.error),
              ),
              child: const Text('Log Out'),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: AppTextStyles.labelLarge.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildListTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing: trailing ??
          (onTap != null
              ? const Icon(Icons.chevron_right, color: AppColors.textTertiary)
              : null),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile(
    BuildContext context,
    WidgetRef ref, {
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      secondary: Icon(icon, color: AppColors.primary),
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
    );
  }

  Widget _buildThemeModeDropdown(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return DropdownButton<ThemeMode>(
      value: themeMode,
      underline: const SizedBox(),
      items: const [
        DropdownMenuItem(value: ThemeMode.system, child: Text('System')),
        DropdownMenuItem(value: ThemeMode.light, child: Text('Light')),
        DropdownMenuItem(value: ThemeMode.dark, child: Text('Dark')),
      ],
      onChanged: (mode) {
        if (mode != null) {
          ref.read(themeModeProvider.notifier).state = mode;
        }
      },
    );
  }

  String _getBiometricName(BiometricType? type) {
    switch (type) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Fingerprint';
      default:
        return 'Biometrics';
    }
  }
}
