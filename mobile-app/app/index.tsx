import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { palette } from '@/theme';

export default function Index() {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={palette.primary[600]} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
});
