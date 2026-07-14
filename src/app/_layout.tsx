import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shareds/infrastructure/http/queryClient';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { useAuthHeartbeat } from '@/shareds/presentation/hooks/useAuthHeartbeat';
import { apurarPalpitesPendentes } from '@/shareds/infrastructure/firebase/apurarPalpites';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (status === 'loading') return;
    SplashScreen.hideAsync();
    if (status === 'authenticated') {
      apurarPalpitesPendentes().catch((err) => console.error('Erro na apuração de palpites', err));
    }
  }, [status]);

  useAuthHeartbeat();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="team/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="small-packet" options={{ presentation: 'modal' }} />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="bet/[jogoId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="match-schedule" options={{ presentation: 'card' }} />
          <Stack.Screen name="album-sticker" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
