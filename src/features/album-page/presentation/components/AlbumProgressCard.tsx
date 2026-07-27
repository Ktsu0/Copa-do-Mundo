import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

interface AlbumProgressCardProps {
  percentage: number;
  collected: number;
  total: number;
}

const RING_SIZE = 120;
const RING_STROKE = 10;

// Anel de progresso sem SVG: o circulo base fica sempre com a cor de
// preenchimento (accent) e cada metade tem uma "mascara" na cor de trilha
// (border) que gira em torno do centro do circulo, cobrindo a parte ainda
// nao alcancada. Girar de 0 a 180 graus em cada metade (direita depois
// esquerda) revela o preenchimento progressivamente, de 0% a 100%.
function ProgressRing({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const angle = clamped * 3.6;
  const rightMaskAngle = Math.min(angle, 180);
  const leftMaskAngle = Math.max(angle - 180, 0);

  const holeSize = RING_SIZE - RING_STROKE * 2;

  return (
    <View style={ringStyles.outer}>
      <View style={[ringStyles.half, { left: RING_SIZE / 2 }]}>
        <View
          style={[
            ringStyles.mask,
            {
              left: 0,
              transformOrigin: 'left center',
              transform: [{ rotate: `${rightMaskAngle}deg` }],
            },
          ]}
        />
      </View>
      <View style={[ringStyles.half, { left: 0 }]}>
        <View
          style={[
            ringStyles.mask,
            {
              left: -RING_SIZE / 2,
              transformOrigin: 'right center',
              transform: [{ rotate: `${leftMaskAngle}deg` }],
            },
          ]}
        />
      </View>
      <View
        style={[
          ringStyles.hole,
          { width: holeSize, height: holeSize, borderRadius: holeSize / 2, top: RING_STROKE, left: RING_STROKE },
        ]}
      >
        <Text style={styles.progressPercentage}>{clamped}%</Text>
      </View>
    </View>
  );
}

export function AlbumProgressCard({ percentage, collected, total }: AlbumProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Minhas Figurinhas</Text>
      <Text style={styles.subtitle}>
        Sua coleção definitiva de figurinhas digitais. Complete os grupos para ganhar recompensas lendárias.
      </Text>

      <View style={styles.progressContainer}>
        <ProgressRing percentage={percentage} />
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

const ringStyles = StyleSheet.create({
  outer: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: theme.colors.accent,
    overflow: 'hidden',
  },
  half: {
    position: 'absolute',
    top: 0,
    width: RING_SIZE / 2,
    height: RING_SIZE,
    overflow: 'hidden',
  },
  mask: {
    position: 'absolute',
    top: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    backgroundColor: theme.colors.border,
  },
  hole: {
    position: 'absolute',
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
