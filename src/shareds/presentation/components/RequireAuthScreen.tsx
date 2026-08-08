import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { theme } from '../constants/theme';
import { FormError } from './FormError';

interface RequireAuthScreenProps {
  children: React.ReactNode;
}

export function RequireAuthScreen({ children }: RequireAuthScreenProps) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    // 'error' (falha no login anonimo) tratado igual a 'guest': manda pro
    // login, onde ainda da pra entrar por e-mail/senha. `replace` em vez de
    // `push` pra logout/login repetidos nao empilharem varias telas de login.
    if (status === 'guest' || status === 'error') {
      router.replace('/login');
    }
  }, [status]);

  if (status !== 'authenticated') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        {status === 'error' && (
          <FormError message="Não foi possível conectar. Verifique sua internet." />
        )}
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
