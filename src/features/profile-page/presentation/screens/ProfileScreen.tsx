import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
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

  const handleSelectAvatar = async (avatarUrl: string) => {
    setAvatarModalVisible(false);
    await updateAvatar(avatarUrl);
  };

  const handleDeleteAccount = async () => {
    const sucesso = await deleteAccount();
    if (sucesso) {
      router.back();
    }
  };

  return (
    <Screen noPadding>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Perfil</Text>
        <View style={styles.backButton} />
      </View>

      {status !== 'authenticated' ? (
        <GuestProfilePrompt />
      ) : isLoading || !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeaderCard
            nome={profile.nome}
            email={profile.email}
            avatarUrl={profile.avatarUrl}
            isSaving={isSaving}
            onPressAvatar={() => setAvatarModalVisible(true)}
            onSaveNome={updateNome}
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
  },
  topBarTitle: {
    ...theme.typography.h3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
});
