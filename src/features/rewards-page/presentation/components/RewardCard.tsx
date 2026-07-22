import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { Reward } from '../../domain/entities/Reward';

interface RewardCardProps {
  reward: Reward;
  userProgress: number;
  onClaim: (id: string) => void;
}

export function RewardCard({ reward, userProgress, onClaim }: RewardCardProps) {
  const progressClamped = Math.min(userProgress, reward.requisitoProgresso);
  const fillPercent = (progressClamped / reward.requisitoProgresso) * 100;

  const getStatusConfig = () => {
    if (reward.resgatado) {
      return { label: 'RESGATADO', color: theme.colors.textMuted, icon: 'checkmark-circle' as const, disabled: true };
    }
    if (reward.resgatavel) {
      return { label: 'RESGATAR', color: theme.colors.accent, icon: 'gift' as const, disabled: false };
    }
    return { label: `${Math.round(fillPercent)}% / 100%`, color: theme.colors.primary, icon: 'lock-closed' as const, disabled: true };
  };

  const status = getStatusConfig();

  return (
    <View style={[styles.card, reward.resgatado && styles.cardClaimed]}>
      <View style={styles.iconWrapper}>
        <View style={[styles.iconCircle, reward.resgatavel && !reward.resgatado && styles.iconCircleActive]}>
          <Ionicons
            name={reward.resgatado ? 'checkmark-circle' : 'trophy'}
            size={28}
            color={reward.resgatado ? theme.colors.textMuted : theme.colors.accent}
          />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, reward.resgatado && styles.titleClaimed]}>{reward.titulo}</Text>
        <Text style={styles.description}>{reward.descricao}</Text>

        {!reward.resgatado && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${fillPercent}%` as any }]} />
          </View>
        )}

        <View style={styles.prizeRow}>
          <Ionicons name="cube" size={14} color={theme.colors.primary} />
          <Text style={styles.prizeText}>
            {reward.premioQuantidade}x {reward.premioTipo === 'pacotes' ? 'Pacotinho(s)' : 'Pontos'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, status.disabled && styles.buttonDisabled]}
        onPress={() => !status.disabled && onClaim(reward.id)}
        disabled={status.disabled}
      >
        <Ionicons name={status.icon} size={16} color={status.disabled ? theme.colors.textMuted : '#0B1221'} />
        {reward.resgatado ? null : (
          <Text style={[styles.buttonText, { color: status.disabled ? theme.colors.textMuted : '#0B1221' }]}>
            {reward.resgatavel ? 'RESGATAR' : status.label}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardClaimed: {
    opacity: 0.55,
  },
  iconWrapper: {
    marginRight: theme.spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconCircleActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: 2,
  },
  titleClaimed: {
    color: theme.colors.textMuted,
  },
  description: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prizeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    gap: 4,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.cardHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
