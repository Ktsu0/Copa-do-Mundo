import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { HeaderWidget } from '@/shareds/presentation/components/HeaderWidget';
import { TeamSearchBar } from '../components/TeamSearchBar';
import { FilterChips } from '../components/FilterChips';
import { TeamCard } from '../components/TeamCard';
import { theme } from '@/shareds/presentation/constants/theme';
import { useTeams } from '../hooks/useTeams';

const FILTER_OPTIONS = ['Todas', 'Favoritas', 'Grupo A', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo G', 'Grupo H'];

export function TeamScreen() {
  const { data: teams, isLoading } = useTeams();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todas');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.nome.toLowerCase().includes(search.toLowerCase()) || 
                          team.grupo.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'Favoritas') {
      matchesFilter = !!team.isFavorito;
    } else if (selectedFilter !== 'Todas') {
      matchesFilter = team.grupo === selectedFilter;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <Screen edges={['top', 'left', 'right']}>
      <HeaderWidget />
      <Text style={styles.title}>Seleções da Copa</Text>
      
      <TeamSearchBar value={search} onChangeText={setSearch} />
      
      <View style={styles.filterContainer}>
        <FilterChips 
          options={FILTER_OPTIONS} 
          selected={selectedFilter} 
          onSelect={setSelectedFilter} 
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => <TeamCard team={item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma seleção encontrada.</Text>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});
