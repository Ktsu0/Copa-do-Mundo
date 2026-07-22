import React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTeamAlbum } from '../hooks/useTeamAlbum';
import { AlbumProgressHeader } from '../components/AlbumProgressHeader';
import { TeamsTabs } from '../components/TeamsTabs';
import { StickersGrid } from '../components/StickersGrid';

export function AlbumStickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data, isLoading, error, selectedTeamId, setSelectedTeamId } = useTeamAlbum(params.groupId as string);

  if (isLoading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar as figurinhas.</Text>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <AlbumProgressHeader progress={data.globalProgress} />
        <TeamsTabs teams={data.teams} selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} />
        <StickersGrid stickers={data.stickers} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 10,
  },
});
