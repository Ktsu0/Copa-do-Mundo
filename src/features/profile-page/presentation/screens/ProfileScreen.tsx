import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { BackButton } from '@/shareds/presentation/components/BackButton';
import { theme } from '@/shareds/presentation/constants/theme';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { ProfileStatsGrid } from '../components/ProfileStatsGrid';
import { DangerZoneCard } from '../components/DangerZoneCard';
import { GuestProfilePrompt } from '../components/GuestProfilePrompt';
import { SignOutButton } from '../components/SignOutButton';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function ProfileScreen() {
  const status = useAuthStore((s) => s.status);
  const { profile, isLoading, isSaving, updateNome, updateAvatar, deleteAccount } = useProfile();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleSaveNome = async (nome: string) => {
    const sucesso = await updateNome(nome);
    if (!sucesso) {
      Alert.alert('Erro', 'Não foi possível atualizar o nome.');
    }
  };

  const handleSelectAvatar = async (avatarUrl: string) => {
    setAvatarModalVisible(false);
    const sucesso = await updateAvatar(avatarUrl);
    if (!sucesso) {
      Alert.alert('Erro', 'Não foi possível atualizar o avatar.');
    }
  };

  const handleDeleteAccount = async () => {
    const sucesso = await deleteAccount();
    if (sucesso) {
      router.back();
    } else {
      Alert.alert('Erro', 'Não foi possível excluir a conta.');
    }
  };

  return (
    <Screen noPadding>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />
        <Text style={styles.topBarTitle}>Perfil</Text>
        <View style={styles.backButton} />
      </View>

      {status !== 'authenticated' ? (
        <GuestProfilePrompt />
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : !profile ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Não foi possível carregar o perfil.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeaderCard
            nome={profile.nome}
            email={profile.email}
            avatarUrl={profile.avatarUrl}
            isSaving={isSaving}
            onPressAvatar={() => setAvatarModalVisible(true)}
            onSaveNome={handleSaveNome}
          />

          <ProfileStatsGrid
            pontos={profile.pontos}
            percentualFigurinhas={profile.percentualFigurinhas}
            figurinhasColetadas={profile.figurinhasColetadas}
            figurinhasTotal={profile.figurinhasTotal}
            estatisticasApostas={profile.estatisticasApostas}
          />

          <SignOutButton />

          <DangerZoneCard isSaving={isSaving} onConfirmDelete={handleDeleteAccount} />

          <AvatarPickerModal
            visible={avatarModalVisible}
            avatarAtual={profile.avatarUrl}
            onSelect={handleSelectAvatar}
            onClose={() => setAvatarModalVisible(false)}
          />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  topBarTitle: {
    ...theme.typography.h3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
});
