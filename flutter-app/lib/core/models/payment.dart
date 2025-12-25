import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../theme/app_colors.dart';

enum InvoiceStatus {
  draft,
  pending,
  partiallyPaid,
  paid,
  overdue,
  cancelled,
  refunded,
}

extension InvoiceStatusExtension on InvoiceStatus {
  String get displayName {
    switch (this) {
      case InvoiceStatus.draft:
        return 'Draft';
      case InvoiceStatus.pending:
        return 'Pending';
      case InvoiceStatus.partiallyPaid:
        return 'Partially Paid';
      case InvoiceStatus.paid:
        return 'Paid';
      case InvoiceStatus.overdue:
        return 'Overdue';
      case InvoiceStatus.cancelled:
        return 'Cancelled';
      case InvoiceStatus.refunded:
        return 'Refunded';
    }
  }

  Color get color {
    switch (this) {
      case InvoiceStatus.draft:
        return AppColors.textSecondary;
      case InvoiceStatus.pending:
        return AppColors.warning;
      case InvoiceStatus.partiallyPaid:
        return Colors.orange;
      case InvoiceStatus.paid:
        return AppColors.success;
      case InvoiceStatus.overdue:
        return AppColors.error;
      case InvoiceStatus.cancelled:
        return AppColors.textSecondary;
      case InvoiceStatus.refunded:
        return Colors.purple;
    }
  }
}

enum PaymentMethod {
  creditCard,
  debitCard,
  bankTransfer,
  applePay,
  googlePay,
  insurance,
  cash,
  check,
}

extension PaymentMethodExtension on PaymentMethod {
  String get displayName {
    switch (this) {
      case PaymentMethod.creditCard:
        return 'Credit Card';
      case PaymentMethod.debitCard:
        return 'Debit Card';
      case PaymentMethod.bankTransfer:
        return 'Bank Transfer';
      case PaymentMethod.applePay:
        return 'Apple Pay';
      case PaymentMethod.googlePay:
        return 'Google Pay';
      case PaymentMethod.insurance:
        return 'Insurance';
      case PaymentMethod.cash:
        return 'Cash';
      case PaymentMethod.check:
        return 'Check';
    }
  }

  IconData get icon {
    switch (this) {
      case PaymentMethod.creditCard:
      case PaymentMethod.debitCard:
        return Icons.credit_card;
      case PaymentMethod.bankTransfer:
        return Icons.account_balance;
      case PaymentMethod.applePay:
        return Icons.apple;
      case PaymentMethod.googlePay:
        return Icons.g_mobiledata;
      case PaymentMethod.insurance:
        return Icons.shield_outlined;
      case PaymentMethod.cash:
        return Icons.money;
      case PaymentMethod.check:
        return Icons.description_outlined;
    }
  }
}

enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  refunded,
  partiallyRefunded,
}

extension PaymentStatusExtension on PaymentStatus {
  String get displayName {
    switch (this) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.processing:
        return 'Processing';
      case PaymentStatus.completed:
        return 'Completed';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.refunded:
        return 'Refunded';
      case PaymentStatus.partiallyRefunded:
        return 'Partially Refunded';
    }
  }

  Color get color {
    switch (this) {
      case PaymentStatus.pending:
      case PaymentStatus.processing:
        return AppColors.warning;
      case PaymentStatus.completed:
        return AppColors.success;
      case PaymentStatus.failed:
        return AppColors.error;
      case PaymentStatus.refunded:
      case PaymentStatus.partiallyRefunded:
        return Colors.purple;
    }
  }
}

class Invoice extends Equatable {
  final String id;
  final String patientId;
  final String invoiceNumber;
  final InvoiceStatus status;
  final DateTime issueDate;
  final DateTime dueDate;
  final double subtotal;
  final double tax;
  final double discount;
  final double total;
  final double amountPaid;
  final double amountDue;
  final List<InvoiceItem>? items;
  final List<Payment>? payments;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Invoice({
    required this.id,
    required this.patientId,
    required this.invoiceNumber,
    required this.status,
    required this.issueDate,
    required this.dueDate,
    required this.subtotal,
    required this.tax,
    required this.discount,
    required this.total,
    required this.amountPaid,
    required this.amountDue,
    this.items,
    this.payments,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isOverdue =>
      status == InvoiceStatus.pending && dueDate.isBefore(DateTime.now());

  String get formattedTotal => _formatCurrency(total);
  String get formattedAmountDue => _formatCurrency(amountDue);
  String get formattedIssueDate => DateFormat('MMM d, yyyy').format(issueDate);
  String get formattedDueDate => DateFormat('MMM d, yyyy').format(dueDate);

  static String _formatCurrency(double amount) {
    return NumberFormat.currency(symbol: '\$').format(amount);
  }

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      invoiceNumber: json['invoice_number'] as String,
      status: InvoiceStatus.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['status'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => InvoiceStatus.pending,
      ),
      issueDate: DateTime.parse(json['issue_date'] as String),
      dueDate: DateTime.parse(json['due_date'] as String),
      subtotal: (json['subtotal'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      amountPaid: (json['amount_paid'] as num).toDouble(),
      amountDue: (json['amount_due'] as num).toDouble(),
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => InvoiceItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      payments: (json['payments'] as List<dynamic>?)
          ?.map((e) => Payment.fromJson(e as Map<String, dynamic>))
          .toList(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, patientId, invoiceNumber, status, total];
}

class InvoiceItem extends Equatable {
  final String id;
  final String invoiceId;
  final String description;
  final String? code;
  final int quantity;
  final double unitPrice;
  final double total;

  const InvoiceItem({
    required this.id,
    required this.invoiceId,
    required this.description,
    this.code,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });

  String get formattedUnitPrice =>
      NumberFormat.currency(symbol: '\$').format(unitPrice);
  String get formattedTotal =>
      NumberFormat.currency(symbol: '\$').format(total);

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      id: json['id'] as String,
      invoiceId: json['invoice_id'] as String,
      description: json['description'] as String,
      code: json['code'] as String?,
      quantity: json['quantity'] as int,
      unitPrice: (json['unit_price'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
    );
  }

  @override
  List<Object?> get props => [id, invoiceId, description, total];
}

class Payment extends Equatable {
  final String id;
  final String patientId;
  final String? invoiceId;
  final double amount;
  final PaymentMethod paymentMethod;
  final PaymentStatus status;
  final String? transactionId;
  final String? cardLast4;
  final String? cardBrand;
  final DateTime? processedAt;
  final DateTime? refundedAt;
  final double? refundAmount;
  final String? notes;
  final DateTime createdAt;

  const Payment({
    required this.id,
    required this.patientId,
    this.invoiceId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.transactionId,
    this.cardLast4,
    this.cardBrand,
    this.processedAt,
    this.refundedAt,
    this.refundAmount,
    this.notes,
    required this.createdAt,
  });

  String get formattedAmount =>
      NumberFormat.currency(symbol: '\$').format(amount);

  String get formattedDate =>
      DateFormat('MMM d, yyyy h:mm a').format(processedAt ?? createdAt);

  String? get cardDisplay {
    if (cardLast4 == null || cardBrand == null) return null;
    return '${cardBrand!} ****$cardLast4';
  }

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      invoiceId: json['invoice_id'] as String?,
      amount: (json['amount'] as num).toDouble(),
      paymentMethod: PaymentMethod.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['payment_method'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => PaymentMethod.creditCard,
      ),
      status: PaymentStatus.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['status'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => PaymentStatus.pending,
      ),
      transactionId: json['transaction_id'] as String?,
      cardLast4: json['card_last4'] as String?,
      cardBrand: json['card_brand'] as String?,
      processedAt: json['processed_at'] != null
          ? DateTime.parse(json['processed_at'] as String)
          : null,
      refundedAt: json['refunded_at'] != null
          ? DateTime.parse(json['refunded_at'] as String)
          : null,
      refundAmount: (json['refund_amount'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, patientId, amount, status];
}

class SavedPaymentMethod extends Equatable {
  final String id;
  final String patientId;
  final PaymentMethod type;
  final String? cardLast4;
  final String? cardBrand;
  final int? expiryMonth;
  final int? expiryYear;
  final bool isDefault;
  final DateTime createdAt;

  const SavedPaymentMethod({
    required this.id,
    required this.patientId,
    required this.type,
    this.cardLast4,
    this.cardBrand,
    this.expiryMonth,
    this.expiryYear,
    required this.isDefault,
    required this.createdAt,
  });

  String get displayName {
    if (cardBrand != null && cardLast4 != null) {
      return '$cardBrand ****$cardLast4';
    }
    return type.displayName;
  }

  String? get expiryDate {
    if (expiryMonth == null || expiryYear == null) return null;
    return '${expiryMonth.toString().padLeft(2, '0')}/${(expiryYear! % 100).toString().padLeft(2, '0')}';
  }

  factory SavedPaymentMethod.fromJson(Map<String, dynamic> json) {
    return SavedPaymentMethod(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      type: PaymentMethod.values.firstWhere(
        (e) =>
            e.name.toUpperCase() ==
            (json['type'] as String).replaceAll('_', '').toUpperCase(),
        orElse: () => PaymentMethod.creditCard,
      ),
      cardLast4: json['card_last4'] as String?,
      cardBrand: json['card_brand'] as String?,
      expiryMonth: json['expiry_month'] as int?,
      expiryYear: json['expiry_year'] as int?,
      isDefault: json['is_default'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, patientId, type, isDefault];
}

class Insurance extends Equatable {
  final String id;
  final String patientId;
  final String provider;
  final String policyNumber;
  final String? groupNumber;
  final String subscriberId;
  final String subscriberName;
  final String relationship;
  final DateTime effectiveDate;
  final DateTime? terminationDate;
  final bool isPrimary;
  final DateTime createdAt;

  const Insurance({
    required this.id,
    required this.patientId,
    required this.provider,
    required this.policyNumber,
    this.groupNumber,
    required this.subscriberId,
    required this.subscriberName,
    required this.relationship,
    required this.effectiveDate,
    this.terminationDate,
    required this.isPrimary,
    required this.createdAt,
  });

  bool get isActive {
    if (terminationDate != null && terminationDate!.isBefore(DateTime.now())) {
      return false;
    }
    return true;
  }

  factory Insurance.fromJson(Map<String, dynamic> json) {
    return Insurance(
      id: json['id'] as String,
      patientId: json['patient_id'] as String,
      provider: json['provider'] as String,
      policyNumber: json['policy_number'] as String,
      groupNumber: json['group_number'] as String?,
      subscriberId: json['subscriber_id'] as String,
      subscriberName: json['subscriber_name'] as String,
      relationship: json['relationship'] as String,
      effectiveDate: DateTime.parse(json['effective_date'] as String),
      terminationDate: json['termination_date'] != null
          ? DateTime.parse(json['termination_date'] as String)
          : null,
      isPrimary: json['is_primary'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, patientId, provider, policyNumber];
}
