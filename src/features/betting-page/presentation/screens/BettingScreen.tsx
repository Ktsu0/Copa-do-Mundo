import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { HeaderWidget } from '@/shareds/presentation/components/HeaderWidget';
import { theme } from '@/shareds/presentation/constants/theme';
import { router } from 'expo-router';
import { useMatches } from '../hooks/useMatches';
import { MatchCard } from '../components/MatchCard';
import { MatchFilterChips } from '../components/MatchFilterChips';
import { Match } from '../../domain/entities/Match';

export function BettingScreen() {
  const { matches, isLoading, filter, changeFilter } = useMatches();

  const handleMatchPress = (match: Match) => {
    router.push(`/bet/${match.id}` as any);
  };

  return (
    <Screen noPadding edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <HeaderWidget />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Seleção de Partidas</Text>

        <MatchFilterChips selected={filter} onSelect={changeFilter} />

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} size="large" />
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma partida disponível para este filtro.</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MatchCard match={item} onPress={handleMatchPress} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  body: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
});
