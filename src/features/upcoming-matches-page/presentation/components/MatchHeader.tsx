import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';
import { MatchDetail } from '../../domain/entities/Bet';

interface MatchHeaderProps {
  match: MatchDetail;
}

const FASE_LABEL: Record<string, string> = {
  dezesseis_avos: 'FASE DE GRUPOS',
  oitavas: 'OITAVAS DE FINAL',
  quartas: 'QUARTAS DE FINAL',
  semifinal: 'SEMIFINAL',
  final: 'FINAL',
};

export function MatchHeader({ match }: MatchHeaderProps) {
  const isLive = match.status === 'ao_vivo';
  const fase = FASE_LABEL[match.fase] ?? match.fase.toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          <Text style={styles.backLabel}>Palpites</Text>
        </TouchableOpacity>
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.matchCard}>
        <Text style={styles.fase}>{fase}</Text>
        {match.data && (
          <Text style={styles.dateText}>
            {new Date(match.data).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        )}

        <View style={styles.teamsRow}>
          <View style={styles.teamSide}>
            <Image source={{ uri: match.timeCasaFlagUrl }} style={styles.flag} />
            <Text style={styles.teamName}>{match.timeCasaNome}</Text>
          </View>

          <Text style={styles.vs}>VS</Text>

          <View style={styles.teamSide}>
            <Image source={{ uri: match.timeForaFlagUrl }} style={styles.flag} />
            <Text style={styles.teamName}>{match.timeForaNome}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backLabel: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  matchCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fase: {
    ...theme.typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.sm,
  },
  teamSide: {
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  teamName: {
    ...theme.typography.h3,
    textAlign: 'center',
  },
  vs: {
    ...theme.typography.h2,
    color: theme.colors.textMuted,
    marginHorizontal: 8,
  },
});
