import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';

import 'medical_record.dart';
import 'user.dart';

class Message extends Equatable {
  final String id;
  final String conversationId;
  final String senderId;
  final String recipientId;
  final String? subject;
  final String body;
  final bool isRead;
  final DateTime? readAt;
  final List<Attachment>? attachments;
  final User? sender;
  final User? recipient;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.recipientId,
    this.subject,
    required this.body,
    required this.isRead,
    this.readAt,
    this.attachments,
    this.sender,
    this.recipient,
    required this.createdAt,
    required this.updatedAt,
  });

  String get formattedDate {
    final now = DateTime.now();
    final diff = now.difference(createdAt);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM d').format(createdAt);
  }

  String get preview {
    if (body.length <= 100) return body;
    return '${body.substring(0, 100)}...';
  }

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      conversationId: json['conversation_id'] as String,
      senderId: json['sender_id'] as String,
      recipientId: json['recipient_id'] as String,
      subject: json['subject'] as String?,
      body: json['body'] as String,
      isRead: json['is_read'] as bool? ?? false,
      readAt: json['read_at'] != null
          ? DateTime.parse(json['read_at'] as String)
          : null,
      attachments: (json['attachments'] as List<dynamic>?)
          ?.map((e) => Attachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      sender: json['sender'] != null
          ? User.fromJson(json['sender'] as Map<String, dynamic>)
          : null,
      recipient: json['recipient'] != null
          ? User.fromJson(json['recipient'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'sender_id': senderId,
      'recipient_id': recipientId,
      'subject': subject,
      'body': body,
      'is_read': isRead,
      'read_at': readAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, conversationId, senderId, recipientId, body];
}

class Conversation extends Equatable {
  final String id;
  final List<User> participants;
  final Message? lastMessage;
  final int unreadCount;
  final String? subject;
  final bool isArchived;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Conversation({
    required this.id,
    required this.participants,
    this.lastMessage,
    required this.unreadCount,
    this.subject,
    required this.isArchived,
    required this.createdAt,
    required this.updatedAt,
  });

  String get displayName {
    if (subject != null && subject!.isNotEmpty) return subject!;
    return participants.map((p) => p.fullName).join(', ');
  }

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] as String,
      participants: (json['participants'] as List<dynamic>)
          .map((e) => User.fromJson(e as Map<String, dynamic>))
          .toList(),
      lastMessage: json['last_message'] != null
          ? Message.fromJson(json['last_message'] as Map<String, dynamic>)
          : null,
      unreadCount: json['unread_count'] as int? ?? 0,
      subject: json['subject'] as String?,
      isArchived: json['is_archived'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  @override
  List<Object?> get props => [id, participants, unreadCount];
}

class SendMessageRequest {
  final String recipientId;
  final String? subject;
  final String body;
  final String? conversationId;

  const SendMessageRequest({
    required this.recipientId,
    this.subject,
    required this.body,
    this.conversationId,
  });

  Map<String, dynamic> toJson() {
    return {
      'recipient_id': recipientId,
      'subject': subject,
      'body': body,
      'conversation_id': conversationId,
    };
  }
}
