import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { theme } from '@/shareds/presentation/constants/theme';

interface TeamHeaderCardProps {
  team: TimeDetalhe;
}

export function TeamHeaderCard({ team }: TeamHeaderCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.flagGlowContainer}>
        <Image source={{ uri: team.bandeiraUrl }} style={styles.flag} resizeMode="cover" />
      </View>
      <Text style={styles.title}>{team.nome}</Text>
      
      <View style={styles.subtitleRow}>
        <Ionicons name="trophy" size={16} color={theme.colors.primary} />
        <Text style={styles.subtitleText}>{team.titulosInfo}</Text>
      </View>

      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{team.federacao}</Text>
        </View>
        {team.isFavorito && (
          <View style={[styles.chip, styles.chipActive]}>
            <Text style={[styles.chipText, styles.chipTextActive]}>FAVORITO</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flagGlowContainer: {
    width: 140,
    height: 90,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  subtitleText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primaryDark,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '700',
    fontSize: 10,
  },
  chipTextActive: {
    color: theme.colors.primary,
  }
});
