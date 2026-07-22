import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

interface GroupTeam {
  id: string;
  name: string;
  flagUrl: string;
}

interface AlbumGroupCardProps {
  groupId: string;
  groupName: string;
  teams: GroupTeam[];
}

export function AlbumGroupCard({ groupId, groupName, teams }: AlbumGroupCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.groupTitle}>{groupName}</Text>

      <View style={styles.teamsGrid}>
        {teams.map(team => (
          <View key={team.id} style={styles.teamItem}>
            <Image source={{ uri: team.flagUrl }} style={styles.teamFlag} />
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/match-schedule?grupo=${groupId.replace('Grupo ', '')}` as any)}
      >
        <Text style={styles.buttonText}>Ver Classificação</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  groupTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  teamItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  teamFlag: {
    width: 24,
    height: 16,
    marginRight: theme.spacing.sm,
    borderRadius: 2,
  },
  teamName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
