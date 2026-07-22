import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';

interface RewardsSummaryCardProps {
  progress: number;
  available: number;
  claimed: number;
}

export function RewardsSummaryCard({ progress, available, claimed }: RewardsSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.value}>{Math.round(progress)}%</Text>
          <Text style={styles.label}>DO ÁLBUM</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={[styles.value, available > 0 && styles.valueGold]}>{available}</Text>
          <Text style={styles.label}>DISPONÍVEIS</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={styles.value}>{claimed}</Text>
          <Text style={styles.label}>RESGATADAS</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  item: {
    alignItems: 'center',
  },
  value: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  valueGold: {
    color: theme.colors.accent,
  },
  label: {
    ...theme.typography.caption,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});
