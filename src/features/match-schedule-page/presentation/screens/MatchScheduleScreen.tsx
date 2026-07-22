import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useGroupSchedule } from '../hooks/useGroupSchedule';
import { ScheduleSectionHeader } from '../components/ScheduleSectionHeader';
import { GroupStandingsTable } from '../components/GroupStandingsTable';
import { MatchCard } from '@/features/betting-page/presentation/components/MatchCard';
import { useLocalSearchParams, router } from 'expo-router';

export function MatchScheduleScreen() {
  const { grupo } = useLocalSearchParams();
  const groupId = typeof grupo === 'string' ? grupo : 'A';
  
  const { data, isLoading, error } = useGroupSchedule(groupId);

  if (isLoading || !data) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </Screen>
    );
  }

  const handleMatchPress = (match: any) => {
    router.push(`/bet/${match.id}` as any);
  };

  return (
    <Screen noPadding>
      <ScheduleSectionHeader title={`Grupo ${data.grupo}`} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <GroupStandingsTable standings={data.standings} />
        
        <View style={styles.matchesContainer}>
          <Text style={styles.sectionTitle}>Jogos do Grupo</Text>
          {data.matches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match as any} 
              onPress={() => handleMatchPress(match)} 
            />
          ))}
          {data.matches.length === 0 && (
            <Text style={styles.emptyText}>Nenhum jogo disponível.</Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  matchesContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
