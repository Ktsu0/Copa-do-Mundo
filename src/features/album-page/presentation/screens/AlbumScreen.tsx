import React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { HeaderWidget } from '@/shareds/presentation/components/HeaderWidget';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAlbum } from '../hooks/useAlbum';
import { useUsuarioAtual } from '@/shareds/presentation/hooks/useUsuarioAtual';
import { AlbumProgressCard } from '../components/AlbumProgressCard';
import { AlbumActionsRow } from '../components/AlbumActionsRow';
import { AlbumGroupList } from '../components/AlbumGroupList';

export function AlbumScreen() {
  const { data, isLoading, error } = useAlbum();
  const { usuario } = useUsuarioAtual();
  const pacotinhos = usuario?.qtd_pacotes ?? 0;

  if (isLoading) {
    return (
      <Screen style={styles.center} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen style={styles.center} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Erro ao carregar o álbum.</Text>
      </Screen>
    );
  }

  return (
    <Screen noPadding edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HeaderWidget />
        </View>

        <AlbumProgressCard
          percentage={data.progress.percentage}
          collected={data.progress.collected}
          total={data.progress.total}
        />

        <AlbumActionsRow pacotinhos={pacotinhos} />

        <AlbumGroupList groups={data.groups} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
});
