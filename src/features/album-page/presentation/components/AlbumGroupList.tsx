import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { AlbumGroup } from '../../domain/entities/Album';
import { AlbumGroupCard } from './AlbumGroupCard';

interface AlbumGroupListProps {
  groups: AlbumGroup[];
}

export function AlbumGroupList({ groups }: AlbumGroupListProps) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Grupos da Copa</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filtrar</Text>
          <Ionicons name="filter" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {groups.map(group => (
          <AlbumGroupCard
            key={group.id}
            groupId={group.id}
            groupName={group.name}
            teams={group.teams}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginRight: 4,
  },
  container: {
    paddingHorizontal: theme.spacing.md,
  },
});
