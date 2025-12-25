import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/common_widgets.dart';
import '../../common/widgets/custom_text_field.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
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
        title: const Text('Messages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_square),
            onPressed: () {
              // Show new message dialog
              _showNewMessageSheet(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: SearchTextField(
              controller: _searchController,
              hint: 'Search messages...',
              onChanged: (value) {
                setState(() {});
              },
            ),
          ),

          // Messages list
          Expanded(
            child: _buildMessagesList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showNewMessageSheet(context),
        child: const Icon(Icons.edit),
      ),
    );
  }

  Widget _buildMessagesList() {
    // TODO: Replace with actual data from provider
    final hasMessages = true;

    if (!hasMessages) {
      return EmptyStateWidget(
        icon: Icons.mail_outline,
        title: 'No Messages',
        message: 'Start a conversation with your healthcare provider',
        actionText: 'New Message',
        onAction: () => _showNewMessageSheet(context),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh messages
      },
      child: ListView.builder(
        itemCount: 5,
        itemBuilder: (context, index) {
          return _ConversationTile(
            name: index == 0 ? 'Dr. Sarah Johnson' : 'Billing Department',
            lastMessage: index == 0
                ? 'Your lab results are ready. Please review them at your earliest convenience.'
                : 'Your payment has been processed successfully.',
            time: index == 0 ? '2h ago' : '1d ago',
            unread: index == 0,
            onTap: () {
              context.go('/messages/conv_$index');
            },
          );
        },
      ),
    );
  }

  void _showNewMessageSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const _NewMessageSheet(),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  final String name;
  final String lastMessage;
  final String time;
  final bool unread;
  final VoidCallback onTap;

  const _ConversationTile({
    required this.name,
    required this.lastMessage,
    required this.time,
    required this.unread,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: unread ? AppColors.primary.withOpacity(0.05) : null,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              AvatarWidget(
                initials: name.split(' ').map((e) => e[0]).take(2).join(),
                size: 48,
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
                            name,
                            style: AppTextStyles.titleSmall.copyWith(
                              fontWeight:
                                  unread ? FontWeight.w600 : FontWeight.w500,
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
                    const SizedBox(height: 4),
                    Text(
                      lastMessage,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (unread)
                Container(
                  width: 10,
                  height: 10,
                  margin: const EdgeInsets.only(left: 8),
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NewMessageSheet extends StatefulWidget {
  const _NewMessageSheet();

  @override
  State<_NewMessageSheet> createState() => _NewMessageSheetState();
}

class _NewMessageSheetState extends State<_NewMessageSheet> {
  String? _selectedProviderId;
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('New Message', style: AppTextStyles.headlineSmall),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Provider selection
            Text('To', style: AppTextStyles.labelMedium),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedProviderId,
              hint: const Text('Select recipient'),
              items: const [
                DropdownMenuItem(value: '1', child: Text('Dr. Sarah Johnson')),
                DropdownMenuItem(value: '2', child: Text('Dr. Michael Chen')),
                DropdownMenuItem(value: '3', child: Text('Billing Department')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedProviderId = value;
                });
              },
              decoration: const InputDecoration(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
            const SizedBox(height: 16),

            // Subject
            TextField(
              controller: _subjectController,
              decoration: const InputDecoration(
                labelText: 'Subject (optional)',
              ),
            ),
            const SizedBox(height: 16),

            // Message
            TextField(
              controller: _messageController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Message',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 20),

            // Send button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _selectedProviderId != null &&
                        _messageController.text.isNotEmpty
                    ? () {
                        // Send message
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Message sent successfully'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    : null,
                child: const Text('Send Message'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
