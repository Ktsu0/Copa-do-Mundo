import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { theme } from '../constants/theme';

interface RequireAuthScreenProps {
  children: React.ReactNode;
}

export function RequireAuthScreen({ children }: RequireAuthScreenProps) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'guest') {
      router.push('/login');
    }
  }, [status]);

  if (status !== 'authenticated') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
