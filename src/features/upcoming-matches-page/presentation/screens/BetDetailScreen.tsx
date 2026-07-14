import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBetDetail } from '../hooks/useBetDetail';
import { MatchHeader } from '../components/MatchHeader';
import { ScoreInput } from '../components/ScoreInput';
import { OptionSelector } from '../components/OptionSelector';
import { RewardBanner } from '../components/RewardBanner';
import { useRequireAuth } from '@/shareds/presentation/hooks/useRequireAuth';

interface BetDetailScreenProps {
  jogoId: string;
}

export function BetDetailScreen({ jogoId }: BetDetailScreenProps) {
  const {
    match, isLoading, isSaving, isSaved, error, isBlocked, hasChanges,
    placarCasa, setPlacarCasa,
    placarFora, setPlacarFora,
    primeiroMarcar, setPrimeiroMarcar,
    vencedor, setVencedor,
    saveBet,
  } = useBetDetail(jogoId);
  const { requireAuth } = useRequireAuth();

  const handleSave = async () => {
    if (isSaved && !hasChanges) {
      router.back();
      return;
    }
    if (!primeiroMarcar || !vencedor) {
      Alert.alert('Palpite incompleto', 'Por favor, selecione todas as opções antes de salvar.');
      return;
    }
    requireAuth(async () => {
      const success = await saveBet();
      if (success) {
        Alert.alert('✅ Palpite Salvo!', 'Seu palpite foi registrado com sucesso. Boa sorte!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o palpite. Verifique se o jogo ainda está disponível.');
      }
    });
  };

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </Screen>
    );
  }

  if (error || !match) {
    return (
      <Screen style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorText}>Partida não encontrada.</Text>
      </Screen>
    );
  }

  const canSave = !isBlocked && !isSaving;
  const isFinishedOrLive = match.status === 'ao_vivo' || match.status === 'finalizado';

  const getStatusMessage = () => {
    if (match.status === 'ao_vivo') return '⚡ Partida em andamento — palpites encerrados.';
    if (match.status === 'finalizado') return '🏁 Partida encerrada — palpites indisponíveis.';
    if (isSaved) return '✏️ Você já tem um palpite salvo. Pode alterá-lo até o jogo começar.';
    return null;
  };

  const statusMsg = getStatusMessage();

  return (
    <Screen noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Match Header com bandeiras + back button */}
        <MatchHeader match={match} />

        {/* Status banner when blocked */}
        {statusMsg && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{statusMsg}</Text>
          </View>
        )}

        {/* Placar */}
        <ScoreInput
          labelCasa={match.timeCasaId}
          labelFora={match.timeForaId}
          scoreCasa={placarCasa}
          scoreFora={placarFora}
          onChangeCasa={setPlacarCasa}
          onChangeFora={setPlacarFora}
          disabled={isBlocked}
        />

        {/* Primeiro time a marcar */}
        <OptionSelector
          label="PRIMEIRO TIME A MARCAR"
          labelCasa={match.timeCasaId}
          labelFora={match.timeForaId}
          selected={primeiroMarcar}
          onSelect={setPrimeiroMarcar}
          disabled={isBlocked}
        />

        {/* Vencedor da partida */}
        <OptionSelector
          label="VENCEDOR DA PARTIDA"
          labelCasa={match.timeCasaId}
          labelFora={match.timeForaId}
          selected={vencedor}
          onSelect={setVencedor}
          disabled={isBlocked}
        />

        {/* Rewards banner */}
        <RewardBanner />

        {/* Save button */}
        {!isFinishedOrLive && (
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isSaving ? (
              <ActivityIndicator color="#0B1221" />
            ) : (
              <>
                <Ionicons
                  name={isSaved ? (hasChanges ? 'sync' : 'arrow-back') : 'send'}
                  size={18}
                  color="#0B1221"
                />
                <Text style={styles.saveButtonText}>
                  {isSaved ? (hasChanges ? 'ATUALIZAR PALPITE' : 'VOLTAR') : 'SALVAR PALPITE'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  statusBanner: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  statusBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: '#0B1221',
    letterSpacing: 1,
  },
});
