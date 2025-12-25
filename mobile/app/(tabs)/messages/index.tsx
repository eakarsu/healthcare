import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import { messagesApi } from '@/api';
import {
  Card,
  CardContent,
  Avatar,
  Badge,
  LoadingState,
  EmptyState,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius, lightTheme } from '@/theme';
import { MessageThread } from '@/types';

export default function MessagesScreen() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThreads = async () => {
    const response = await messagesApi.getThreads();
    if (response.success && response.data) {
      setThreads(response.data.items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchThreads();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const handleThreadPress = (thread: MessageThread) => {
    router.push(`/(tabs)/messages/${thread.id}`);
  };

  const handleCompose = () => {
    router.push('/(tabs)/messages/compose');
  };

  const renderThread = ({ item }: { item: MessageThread }) => {
    const hasUnread = item.unreadCount > 0;
    const otherParticipant = item.participants.find(
      (p) => p.role !== 'PATIENT'
    );

    return (
      <TouchableOpacity
        style={[styles.threadItem, hasUnread && styles.threadItemUnread]}
        onPress={() => handleThreadPress(item)}
        activeOpacity={0.7}
      >
        <Avatar
          name={otherParticipant?.name}
          source={otherParticipant?.avatarUrl}
          size="md"
        />
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text
              style={[
                styles.threadSender,
                hasUnread && styles.threadSenderUnread,
              ]}
              numberOfLines={1}
            >
              {otherParticipant?.name || 'Unknown'}
            </Text>
            <Text style={styles.threadDate}>
              {formatDate(item.updatedAt)}
            </Text>
          </View>
          <Text
            style={[
              styles.threadSubject,
              hasUnread && styles.threadSubjectUnread,
            ]}
            numberOfLines={1}
          >
            {item.subject}
          </Text>
          {item.lastMessage && (
            <Text style={styles.threadPreview} numberOfLines={2}>
              {item.lastMessage.body}
            </Text>
          )}
        </View>
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading messages..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {threads.filter((t) => t.unreadCount > 0).length} unread
          </Text>
        </View>
        <TouchableOpacity style={styles.composeButton} onPress={handleCompose}>
          <Ionicons name="create-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No Messages"
            description="You don't have any messages yet. Start a conversation with your care team."
            actionLabel="New Message"
            onAction={handleCompose}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  composeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...lightTheme.shadows.md,
  },
  listContent: {
    flexGrow: 1,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4],
    gap: spacing[3],
  },
  threadItemUnread: {
    backgroundColor: colors.primary[50],
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[0.5],
  },
  threadSender: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    flex: 1,
    marginRight: spacing[2],
  },
  threadSenderUnread: {
    fontWeight: typography.fontWeight.bold,
  },
  threadDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  threadSubject: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing[1],
  },
  threadSubjectUnread: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  threadPreview: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1.5],
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginLeft: spacing[4] + 40 + spacing[3],
  },
});
