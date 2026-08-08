import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlbumProgress } from '../../../album-page/domain/entities/Album';
import { theme } from '@/shareds/presentation/constants/theme';
import { ProgressBar } from '@/shareds/presentation/components/ProgressBar';

interface AlbumProgressHeaderProps {
  progress: AlbumProgress;
}

export function AlbumProgressHeader({ progress }: AlbumProgressHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <View>
          <Text style={styles.title}>Álbum por Seleção</Text>
          <Text style={styles.subtitle}>Progresso Global</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.percentage}>{progress.percentage}%</Text>
          <Text style={styles.fraction}>{progress.collected}/{progress.total} COLECIONADAS</Text>
        </View>
      </View>
      <ProgressBar
        percentage={progress.percentage}
        height={8}
        trackColor={theme.colors.cardHover}
        style={styles.progressBarOverride}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xxl + 20,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  percentage: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    lineHeight: 28,
  },
  fraction: {
    ...theme.typography.caption,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  // O header original não tinha espaço abaixo da barra de progresso; zera
  // o marginBottom padrão do ProgressBar pra manter a mesma aparência.
  progressBarOverride: {
    marginBottom: 0,
  },
});
