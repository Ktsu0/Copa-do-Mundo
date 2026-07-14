import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';
import { BettingStats } from '../../domain/entities/Profile';

interface ProfileStatsGridProps {
  pontos: number;
  percentualFigurinhas: number;
  figurinhasColetadas: number;
  figurinhasTotal: number;
  estatisticasApostas: BettingStats;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ProfileStatsGrid({
  pontos, percentualFigurinhas, figurinhasColetadas, figurinhasTotal, estatisticasApostas,
}: ProfileStatsGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatBox label="Pontos" value={pontos.toLocaleString('pt-BR')} />
        <StatBox label="Álbum" value={`${percentualFigurinhas}%`} />
      </View>
      <Text style={styles.subLabel}>
        {figurinhasColetadas} de {figurinhasTotal} figurinhas coletadas
      </Text>

      <Text style={styles.sectionTitle}>Estatísticas de Apostas</Text>
      <View style={styles.row}>
        <StatBox label="Total" value={String(estatisticasApostas.total)} />
        <StatBox label="Acertos" value={String(estatisticasApostas.acertos)} />
      </View>
      <View style={styles.row}>
        <StatBox label="Erros" value={String(estatisticasApostas.erros)} />
        <StatBox label="Pendentes" value={String(estatisticasApostas.pendentes)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  box: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  value: {
    ...theme.typography.h2,
    color: theme.colors.accent,
  },
  label: {
    ...theme.typography.caption,
    marginTop: 2,
  },
  subLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
});
