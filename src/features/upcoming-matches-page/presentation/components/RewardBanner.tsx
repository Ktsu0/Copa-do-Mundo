import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { BET_REWARDS } from '../../domain/entities/Bet';

export function RewardBanner() {
  // "Primeiro a marcar" nao pode ser apurado hoje -- os jogos (SQLite) nao
  // guardam quem fez o primeiro gol, entao nenhum palpite desse tipo chega a
  // ser avaliado (ver apurarPalpites.ts). Ate essa informacao existir em
  // algum lugar, mostramos como "em breve" em vez de prometer pontos que
  // nunca sao creditados.
  const rewards = [
    { label: 'Placar exato', pts: BET_REWARDS.placarExato, icon: 'football' as const, pending: false },
    { label: 'Vencedor da partida', pts: BET_REWARDS.vencedor, icon: 'trophy' as const, pending: false },
    { label: 'Primeiro a marcar', pts: BET_REWARDS.primeiroMarcar, icon: 'flash' as const, pending: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="ribbon" size={20} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>Recompensas de Acerto</Text>
      </View>

      <View style={styles.rewardsRow}>
        {rewards.map((r) => (
          <View key={r.label} style={styles.rewardItem}>
            <Ionicons name={r.icon} size={18} color={r.pending ? theme.colors.textMuted : theme.colors.accent} />
            <Text style={[styles.rewardPts, r.pending && styles.rewardPtsPending]}>
              {r.pending ? 'Em breve' : `+${r.pts}`}
            </Text>
            <Text style={styles.rewardLabel}>{r.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255,215,0,0.07)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.accent,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  rewardPts: {
    ...theme.typography.h3,
    color: theme.colors.accent,
    fontWeight: '900',
  },
  rewardPtsPending: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  rewardLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
    fontSize: 9,
  },
});
