import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Sticker } from '../../domain/entities/Sticker';
import { theme } from '@/shareds/presentation/constants/theme';

interface StickersGridProps {
  stickers: Sticker[];
}

export function StickersGrid({ stickers }: StickersGridProps) {
  return (
    <View style={styles.grid}>
      {stickers.map(sticker => (
        sticker.isCollected
          ? <CollectedSticker key={sticker.id} sticker={sticker} />
          : <UncollectedSticker key={sticker.id} sticker={sticker} />
      ))}
    </View>
  );
}

function CollectedSticker({ sticker }: { sticker: Sticker }) {
  return (
    <View style={styles.collected}>
      {sticker.imageUrl ? (
        <Image source={{ uri: sticker.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="person" size={32} color={theme.colors.textMuted} />
        </View>
      )}
      <View style={[styles.cornerBadge, styles.positionBadge]}>
        <Text style={styles.badgeText}>{sticker.position}</Text>
      </View>
      <View style={[styles.cornerBadge, styles.numberBadge]}>
        <Text style={styles.badgeText}>{sticker.number}</Text>
      </View>
      <View style={styles.overlay}>
        <Text style={styles.playerName} numberOfLines={1}>{sticker.playerName}</Text>
      </View>
    </View>
  );
}

function UncollectedSticker({ sticker }: { sticker: Sticker }) {
  return (
    <View style={styles.uncollected}>
      <Ionicons name="person-outline" size={32} color={theme.colors.textMuted} />
      <Text style={styles.uncollectedCode}>{sticker.code}</Text>
      <Text style={styles.uncollectedName}>{sticker.playerName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
  },
  collected: {
    width: '46%',
    aspectRatio: 0.7,
    margin: '2%',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardHover,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cornerBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  positionBadge: {
    left: theme.spacing.xs,
  },
  numberBadge: {
    right: theme.spacing.xs,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  playerName: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '700',
  },
  uncollected: {
    width: '46%',
    aspectRatio: 0.7,
    margin: '2%',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.cardHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncollectedCode: {
    ...theme.typography.caption,
    marginTop: theme.spacing.md,
    fontWeight: 'bold',
  },
  uncollectedName: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
