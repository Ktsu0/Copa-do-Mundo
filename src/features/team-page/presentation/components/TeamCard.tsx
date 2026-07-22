import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TimeResumo } from '../../domain/entities/TimeResumo';
import { theme } from '@/shareds/presentation/constants/theme';
import { Link } from 'expo-router';

interface TeamCardProps {
  team: TimeResumo;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/team/${team.id}`} asChild>
      <TouchableOpacity style={styles.container} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: team.bandeiraUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{team.grupo.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{team.nome}</Text>
          <Text style={styles.subtitle}>{team.subtitulo.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    flex: 1,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    height: 90,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000', // fallback if image loads slow
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(11, 18, 33, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  name: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
  },
});
