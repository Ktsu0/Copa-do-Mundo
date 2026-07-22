import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StickerTeam } from '../../domain/entities/Sticker';
import { theme } from '@/shareds/presentation/constants/theme';

interface TeamsTabsProps {
  teams: StickerTeam[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

export function TeamsTabs({ teams, selectedTeamId, onSelectTeam }: TeamsTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {teams.map(team => {
        const isSelected = team.id === selectedTeamId;
        return (
          <TouchableOpacity
            key={team.id}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onSelectTeam(team.id)}
          >
            <Ionicons name="flag-outline" size={16} color={isSelected ? theme.colors.background : theme.colors.textMuted} style={styles.icon} />
            <Text style={[styles.text, isSelected && styles.textSelected]}>{team.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  text: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  textSelected: {
    color: theme.colors.background,
  },
});
