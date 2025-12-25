import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/payment.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../common/widgets/common_widgets.dart';

class PaymentsScreen extends ConsumerStatefulWidget {
  const PaymentsScreen({super.key});

  @override
  ConsumerState<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends ConsumerState<PaymentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Invoices'),
            Tab(text: 'History'),
            Tab(text: 'Methods'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _InvoicesTab(),
          _HistoryTab(),
          _PaymentMethodsTab(),
        ],
      ),
    );
  }
}

class _InvoicesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual data
    final outstandingBalance = 245.00;

    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Outstanding Balance Card
          if (outstandingBalance > 0)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Outstanding Balance',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${outstandingBalance.toStringAsFixed(2)}',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                      ),
                      child: const Text('Pay Now'),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 24),

          // Invoices List
          const SectionHeader(title: 'Recent Invoices'),
          const SizedBox(height: 12),
          ...List.generate(3, (index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _InvoiceCard(
                invoiceNumber: 'INV-${2024001 + index}',
                amount: 150.00 + (index * 50),
                dueDate: 'Dec ${28 - index}, 2025',
                status: index == 0
                    ? InvoiceStatus.pending
                    : index == 1
                        ? InvoiceStatus.paid
                        : InvoiceStatus.overdue,
                onTap: () {},
                onPay: index != 1 ? () {} : null,
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final String invoiceNumber;
  final double amount;
  final String dueDate;
  final InvoiceStatus status;
  final VoidCallback onTap;
  final VoidCallback? onPay;

  const _InvoiceCard({
    required this.invoiceNumber,
    required this.amount,
    required this.dueDate,
    required this.status,
    required this.onTap,
    this.onPay,
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
            border: Border.all(
              color: status == InvoiceStatus.overdue
                  ? AppColors.error.withOpacity(0.3)
                  : AppColors.border,
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(invoiceNumber, style: AppTextStyles.titleSmall),
                        const SizedBox(height: 4),
                        Text(
                          'Due: $dueDate',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  StatusBadge(
                    text: status.displayName,
                    color: status.color,
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Amount Due',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                      Text(
                        '\$${amount.toStringAsFixed(2)}',
                        style: AppTextStyles.titleMedium,
                      ),
                    ],
                  ),
                  const Spacer(),
                  if (onPay != null)
                    ElevatedButton(
                      onPressed: onPay,
                      child: const Text('Pay'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HistoryTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _PaymentHistoryItem(
              amount: 150.00 + (index * 25),
              date: 'Dec ${20 - index}, 2025',
              method: 'Visa ****4242',
              status: PaymentStatus.completed,
            ),
          );
        },
      ),
    );
  }
}

class _PaymentHistoryItem extends StatelessWidget {
  final double amount;
  final String date;
  final String method;
  final PaymentStatus status;

  const _PaymentHistoryItem({
    required this.amount,
    required this.date,
    required this.method,
    required this.status,
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
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.check_circle, color: AppColors.success),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '\$${amount.toStringAsFixed(2)}',
                  style: AppTextStyles.titleSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  '$method • $date',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          StatusBadge(text: status.displayName, color: status.color),
        ],
      ),
    );
  }
}

class _PaymentMethodsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Add new method button
        OutlinedButton.icon(
          onPressed: () {
            // Add payment method
          },
          icon: const Icon(Icons.add),
          label: const Text('Add Payment Method'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.all(16),
          ),
        ),
        const SizedBox(height: 24),

        const SectionHeader(title: 'Saved Cards'),
        const SizedBox(height: 12),

        _PaymentMethodCard(
          brand: 'Visa',
          last4: '4242',
          expiry: '12/26',
          isDefault: true,
          onDelete: () {},
          onSetDefault: null,
        ),
        const SizedBox(height: 12),
        _PaymentMethodCard(
          brand: 'Mastercard',
          last4: '8888',
          expiry: '03/25',
          isDefault: false,
          onDelete: () {},
          onSetDefault: () {},
        ),

        const SizedBox(height: 24),
        const SectionHeader(title: 'Insurance'),
        const SizedBox(height: 12),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Blue Cross Blue Shield', style: AppTextStyles.titleSmall),
                  const Spacer(),
                  const StatusBadge(text: 'Primary', color: AppColors.primary),
                ],
              ),
              const SizedBox(height: 12),
              InfoRow(label: 'Policy #', value: 'BCB123456789'),
              const SizedBox(height: 8),
              InfoRow(label: 'Group #', value: 'GRP001'),
              const SizedBox(height: 8),
              InfoRow(label: 'Subscriber', value: 'John Doe'),
            ],
          ),
        ),
      ],
    );
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final String brand;
  final String last4;
  final String expiry;
  final bool isDefault;
  final VoidCallback onDelete;
  final VoidCallback? onSetDefault;

  const _PaymentMethodCard({
    required this.brand,
    required this.last4,
    required this.expiry,
    required this.isDefault,
    required this.onDelete,
    this.onSetDefault,
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
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.credit_card, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$brand ****$last4', style: AppTextStyles.titleSmall),
                Text(
                  'Expires $expiry',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (isDefault)
            const StatusBadge(text: 'Default', color: AppColors.primary)
          else
            PopupMenuButton(
              itemBuilder: (context) => [
                PopupMenuItem(
                  onTap: onSetDefault,
                  child: const Text('Set as default'),
                ),
                PopupMenuItem(
                  onTap: onDelete,
                  child: Text(
                    'Delete',
                    style: TextStyle(color: AppColors.error),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
