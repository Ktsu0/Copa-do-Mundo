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
  const isGold = sticker.type === 'gold';
  return (
    <View style={[styles.collected, isGold && styles.gold]}>
      <Image source={sticker.imageUrl} style={styles.image} contentFit="cover" />
      <View style={styles.overlay}>
        <Text style={styles.code}>{sticker.code}</Text>
        <Text style={styles.playerName}>{sticker.playerName}</Text>
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
  gold: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  code: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  playerName: {
    ...theme.typography.h3,
    color: theme.colors.text,
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
