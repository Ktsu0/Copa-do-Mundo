import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useRewards } from '../hooks/useRewards';
import { RewardCard } from '../components/RewardCard';
import { RewardsSectionHeader } from '../components/RewardsSectionHeader';
import { RewardsSummaryCard } from '../components/RewardsSummaryCard';
import { useUsuarioAtual } from '@/shareds/presentation/hooks/useUsuarioAtual';
import { getJogadoresTotal } from '@/shareds/infrastructure/sqlite/jogadoresQueries';

export function RewardsScreen() {
  const { rewards, isLoading, claimReward } = useRewards();
  const [claiming, setClaiming] = useState<string | null>(null);

  const { usuario } = useUsuarioAtual();
  const total = getJogadoresTotal();
  const collected = usuario?.album_jogador?.length ?? 0;
  const progress = total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0;
  const pacotinhos = usuario?.qtd_pacotes ?? 0;

  const available = rewards.filter(r => r.resgatavel && !r.resgatado).length;
  const claimed = rewards.filter(r => r.resgatado).length;

  const handleClaim = async (id: string) => {
    setClaiming(id);
    const success = await claimReward(id);
    setClaiming(null);
    if (success) {
      Alert.alert('🎉 Recompensa Resgatada!', 'Pacotinhos adicionados com sucesso.', [{ text: 'OK' }]);
    }
  };

  return (
    <Screen noPadding>
      <RewardsSectionHeader pacotinhos={pacotinhos} />
      <RewardsSummaryCard progress={progress} available={available} claimed={claimed} />

      {isLoading ? (
        <ActivityIndicator color={theme.colors.accent} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Conquistas do Álbum</Text>
          {rewards.map(reward => (
            <View key={reward.id} style={{ opacity: claiming === reward.id ? 0.6 : 1 }}>
              <RewardCard reward={reward} userProgress={progress} onClaim={handleClaim} />
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: theme.spacing.xl,
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
});
