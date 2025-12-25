import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

export default function Screen() {
  const theme = useTheme();
  const screenName = 'Health Records';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h2">{screenName}</Text>
      </View>
      <View style={styles.content}>
        <Text variant="body" color={theme.colors.textSecondary} align="center">
          This screen is under development.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing[6], paddingBottom: spacing[4] },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
});
