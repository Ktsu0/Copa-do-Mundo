import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TimeResumo } from '../../domain/entities/TimeResumo';
import { theme } from '@/shareds/presentation/constants/theme';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { cardBaseStyle } from '@/shareds/presentation/components/Card';

// Variante com transparencia de theme.colors.background (#0B1221), reusada no
// badge de grupo e no botao de favorito.
const OVERLAY_BG = 'rgba(11, 18, 33, 0.7)';

interface TeamCardProps {
  team: TimeResumo;
  onToggleFavorito?: (id: string) => void;
}

export function TeamCard({ team, onToggleFavorito }: TeamCardProps) {
  const status = useAuthStore((s) => s.status);

  const handleFavoritoPress = () => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }
    onToggleFavorito?.(team.id);
  };

  return (
    <Link href={`/team/${team.id}`} asChild>
      <TouchableOpacity style={styles.container} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: team.bandeiraUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{team.grupo.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoritoButton}
            onPress={handleFavoritoPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={team.isFavorito ? 'star' : 'star-outline'}
              size={16}
              color={team.isFavorito ? theme.colors.primary : theme.colors.text}
            />
          </TouchableOpacity>
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
    ...cardBaseStyle,
    overflow: 'hidden',
    flex: 1,
    margin: theme.spacing.xs,
  },
  imageContainer: {
    height: 90,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.background, // fallback if image loads slow
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
    backgroundColor: OVERLAY_BG,
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
  favoritoButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: OVERLAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
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
