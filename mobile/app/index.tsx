import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store';
import { LoadingState } from '@/components/ui';
import { colors } from '@/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState message="Loading..." fullScreen />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/appointments" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
