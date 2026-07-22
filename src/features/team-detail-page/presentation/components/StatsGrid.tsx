import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { theme } from '@/shareds/presentation/constants/theme';

interface StatsGridProps {
  stats: TimeDetalhe['estatisticas'];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.card}>
          <Ionicons name="people" size={24} color={theme.colors.accent} style={styles.icon} />
          <Text style={styles.label}>JOGADORES</Text>
          <Text style={styles.value}>{stats.jogadores}</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="trophy-outline" size={24} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.label}>RANKING FIFA</Text>
          <Text style={styles.value}>{stats.rankingFifa}</Text>
        </View>
      </View>
      
      <View style={[styles.card, styles.fullCard]}>
        <Ionicons name="shapes-outline" size={24} color={theme.colors.textMuted} style={styles.icon} />
        <Text style={styles.label}>GRUPO</Text>
        <Text style={styles.value}>{stats.grupo}</Text>
      </View>
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
