import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';
import { DailyReward } from '../../domain/entities/HomeData';

interface DailyRewardBannerProps {
  reward: DailyReward;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Dado estatico (nao depende de props/estado) -- fica fora do componente
// pra nao ser recriado a cada render. So ilustrativo (nao reflete o sorteio
// real do pacotinho, que e uniforme sobre todo o elenco).
const PACOTE_PREVIEW_CARDS = [
  { name: 'JOGADOR', flag: '🇦🇷' },
  { name: 'JOGADOR', flag: '🇧🇷' },
  { name: 'JOGADOR', flag: '🇫🇷' },
];

export function DailyRewardBanner({ reward }: DailyRewardBannerProps) {
  const [remaining, setRemaining] = useState(reward.countdownSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.card}>
      {/* Countdown pill */}
      <View style={styles.countdownPill}>
        <Ionicons name="time-outline" size={12} color={theme.colors.accent} />
        <Text style={styles.countdownText}> {formatCountdown(remaining)}</Text>
      </View>

      {/* Title block */}
      <Text style={styles.title}>{reward.packetType}</Text>
      <Text style={styles.subtitle}>Contém {reward.cardsCount} cartas de jogadores aleatórios.</Text>

      {/* Cards illustration */}
      <View style={styles.cardsRow}>
        {PACOTE_PREVIEW_CARDS.map((p, i) => (
          <View key={i} style={[styles.miniCard, i === 1 && styles.miniCardCenter]}>
            <View style={styles.miniCardHeader}>
              <Text style={styles.miniCardFlag}>{p.flag}</Text>
            </View>
            <View style={[styles.miniCardPhoto, styles.miniCardPhotoFallback]}>
              <Ionicons name="person" size={28} color={theme.colors.textMuted} />
            </View>
            <View style={styles.miniCardNameBg}>
              <Text style={styles.miniCardName}>{p.name}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/small-packet' as any)}
      >
        <Text style={styles.buttonText}>RESGATAR AGORA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: '#0F1B30',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    overflow: 'hidden',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.xl,
  },
  miniCard: {
    width: 80,
    height: 112,
    backgroundColor: '#161F33',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniCardCenter: {
    width: 96,
    height: 134,
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  miniCardPhoto: {
    flex: 1,
    width: '100%',
    borderRadius: 4,
  },
  miniCardPhotoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1221',
  },
  miniCardFlag: {
    fontSize: 12,
  },
  miniCardNameBg: {
    backgroundColor: theme.colors.accent,
    width: '100%',
    alignItems: 'center',
    borderRadius: 2,
    paddingVertical: 1,
  },
  miniCardName: {
    fontSize: 7,
    fontWeight: '900',
    color: '#0B1221',
  },
  button: {
    backgroundColor: theme.colors.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '900',
    color: '#0B1221',
    letterSpacing: 2,
  },
});
