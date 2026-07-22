import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { Match } from '../../domain/entities/Match';

interface MatchCardProps {
  match: Match;
  onPress: (match: Match) => void;
}

const FASE_LABEL: Record<string, string> = {
  dezesseis_avos: 'FASE DE GRUPOS',
  oitavas: 'OITAVAS DE FINAL',
  quartas: 'QUARTAS DE FINAL',
  semifinal: 'SEMIFINAL',
  final: 'FINAL',
};

export function MatchCard({ match, onPress }: MatchCardProps) {
  const isLive = match.status === 'ao_vivo';
  const isFinished = match.status === 'finalizado';
  const isBlocked = isLive || isFinished;

  const faseLabel = FASE_LABEL[match.fase] ?? match.fase.toUpperCase();

  const getStatusBadge = () => {
    if (isLive) {
      return <View style={[styles.badge, styles.badgeLive]}><Text style={styles.badgeLiveText}>● AO VIVO</Text></View>;
    }
    if (isFinished) {
      return <View style={[styles.badge, styles.badgeFinished]}><Text style={styles.badgeText}>ENCERRADO</Text></View>;
    }
    if (match.temPalpite) {
      return <View style={[styles.badge, styles.badgeSaved]}><Ionicons name="checkmark-circle" size={10} color={theme.colors.primary} /><Text style={[styles.badgeText, styles.badgeSavedText]}> Palpite enviado</Text></View>;
    }
    return <View style={[styles.badge, styles.badgeActive]}><Text style={styles.badgeActiveText}>● Ativo</Text></View>;
  };

  const getButtonLabel = () => {
    if (isLive || isFinished) return 'Palpite Indisponível';
    if (match.temPalpite) return 'Editar Palpite';
    return 'Enviar Palpite';
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.faseLabel}>{faseLabel}</Text>
        {getStatusBadge()}
      </View>

      <View style={styles.teamsRow}>
        {/* Casa */}
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.timeCasaFlagUrl }} style={styles.flag} />
          <Text style={styles.teamSigla}>{match.timeCasaId}</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreBlock}>
          {(match.placarCasa !== null && match.placarFora !== null) ? (
            <>
              <View style={styles.scoreBox}><Text style={styles.scoreText}>{match.placarCasa}</Text></View>
              <Text style={styles.scoreX}>X</Text>
              <View style={styles.scoreBox}><Text style={styles.scoreText}>{match.placarFora}</Text></View>
            </>
          ) : (
            <>
              <View style={styles.scoreBox} />
              <Text style={styles.scoreX}>X</Text>
              <View style={styles.scoreBox} />
            </>
          )}
        </View>

        {/* Fora */}
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.timeForaFlagUrl }} style={styles.flag} />
          <Text style={styles.teamSigla}>{match.timeForaId}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isBlocked && styles.buttonBlocked]}
        onPress={() => !isBlocked && onPress(match)}
        disabled={isBlocked}
      >
        <Text style={[styles.buttonText, isBlocked && styles.buttonTextBlocked]}>
          {getButtonLabel()}
        </Text>
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  faseLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  badgeLive: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  badgeLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  badgeActive: {
    backgroundColor: 'rgba(0,184,115,0.12)',
  },
  badgeActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  badgeFinished: {
    backgroundColor: theme.colors.cardHover,
  },
  badgeSaved: {
    backgroundColor: theme.colors.cardHover,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  badgeSavedText: {
    color: theme.colors.primary,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  teamBlock: {
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  teamSigla: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  scoreBox: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.cardHover,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  scoreX: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  buttonBlocked: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: '#0B1221',
    letterSpacing: 0.5,
  },
  buttonTextBlocked: {
    color: theme.colors.textMuted,
  },
});
