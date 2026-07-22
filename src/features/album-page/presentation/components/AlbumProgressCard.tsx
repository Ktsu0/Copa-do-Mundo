import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

interface AlbumProgressCardProps {
  percentage: number;
  collected: number;
  total: number;
}

export function AlbumProgressCard({ percentage, collected, total }: AlbumProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Minhas Figurinhas</Text>
      <Text style={styles.subtitle}>
        Sua coleção definitiva de figurinhas digitais. Complete os grupos para ganhar recompensas lendárias.
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.progressTextContainer}>
        <Text style={styles.progressFraction}>{collected} / {total}</Text>
        <Text style={styles.progressLabel}>FIGURINHAS COLECIONADAS</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/album-sticker' as any)}>
        <Text style={styles.buttonText}>Ver Figurinhas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: theme.colors.accent,
    borderLeftColor: theme.colors.border,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    fontSize: 32,
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressFraction: {
    ...theme.typography.h2,
    marginBottom: 4,
  },
  progressLabel: {
    ...theme.typography.caption,
    letterSpacing: 1,
  },
  button: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
