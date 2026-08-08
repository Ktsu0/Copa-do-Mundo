import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  container: {
    paddingHorizontal: theme.spacing.md,
  },
});
