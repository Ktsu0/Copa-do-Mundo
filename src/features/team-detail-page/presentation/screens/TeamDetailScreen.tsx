import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TeamHeaderCard } from '../components/TeamHeaderCard';
import { StatsGrid } from '../components/StatsGrid';
import { SquadList } from '../components/SquadList';
import { theme } from '@/shareds/presentation/constants/theme';
import { useTeamDetail } from '../hooks/useTeamDetail';

interface TeamDetailScreenProps {
  teamId: string;
}

export function TeamDetailScreen({ teamId }: TeamDetailScreenProps) {
  const { data: team, isLoading } = useTeamDetail(teamId);

  return (
    <Screen noPadding>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {isLoading || !team ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TeamHeaderCard team={team} />
          <StatsGrid stats={team.estatisticas} />
          <SquadList elenco={team.elenco} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
});
