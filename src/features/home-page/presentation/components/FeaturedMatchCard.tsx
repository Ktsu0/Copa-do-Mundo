import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';
import { FeaturedMatch } from '../../domain/entities/HomeData';

interface FeaturedMatchCardProps {
  match: FeaturedMatch;
}

export function FeaturedMatchCard({ match }: FeaturedMatchCardProps) {
  const isLive = match.status === 'ao_vivo';
  const hasScore = match.placarCasa !== null && match.placarFora !== null;

  const handlePress = () => {
    router.push(`/bet/${match.id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="flame" size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Partida em Destaque</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/betting' as any)} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Todas as{'\n'}Partidas</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Match card */}
      <TouchableOpacity onPress={handlePress} style={styles.card}>
        {isLive && (
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>● AO VIVO{match.minuto ? ` - ${match.minuto}'` : ''}</Text>
          </View>
        )}

        <View style={styles.teamsRow}>
          {/* Casa */}
          <View style={styles.teamSide}>
            <Image source={{ uri: match.flagCasa }} style={styles.flag} />
            <Text style={styles.teamName}>{match.timeCasaNome}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreCenter}>
            {hasScore ? (
              <Text style={styles.score}>{match.placarCasa} - {match.placarFora}</Text>
            ) : (
              <Text style={styles.score}>VS</Text>
            )}
          </View>

          {/* Fora */}
          <View style={styles.teamSide}>
            <Image source={{ uri: match.flagFora }} style={styles.flag} />
            <Text style={styles.teamName}>{match.timeForaNome}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'right',
    lineHeight: 14,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  livePill: {
    backgroundColor: 'rgba(0,184,115,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,184,115,0.3)',
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: theme.spacing.md,
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  teamSide: {
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  teamName: {
    ...theme.typography.h3,
    textAlign: 'center',
  },
  scoreCenter: {
    flex: 1,
    alignItems: 'center',
  },
  score: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.text,
    fontWeight: '900',
  },
});
