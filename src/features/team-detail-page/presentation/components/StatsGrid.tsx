import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { theme } from '@/shareds/presentation/constants/theme';
import { Card } from '@/shareds/presentation/components/Card';

interface StatsGridProps {
  stats: TimeDetalhe['estatisticas'];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Ionicons name="people" size={24} color={theme.colors.accent} style={styles.icon} />
          <Text style={styles.label}>JOGADORES</Text>
          <Text style={styles.value}>{stats.jogadores}</Text>
        </Card>
        <Card style={styles.card}>
          <Ionicons name="trophy-outline" size={24} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.label}>RANKING FIFA</Text>
          <Text style={styles.value}>{stats.rankingFifa}</Text>
        </Card>
      </View>

      <Card style={[styles.card, styles.fullCard]}>
        <Ionicons name="shapes-outline" size={24} color={theme.colors.textMuted} style={styles.icon} />
        <Text style={styles.label}>GRUPO</Text>
        <Text style={styles.value}>{stats.grupo}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  card: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  fullCard: {
    width: '100%',
  },
  icon: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.caption,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.h1,
    fontSize: 28,
  }
});
