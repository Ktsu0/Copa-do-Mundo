import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

interface AlbumActionsRowProps {
  pacotinhos: number;
}

export function AlbumActionsRow({ pacotinhos }: AlbumActionsRowProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/small-packet' as any)}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="cube" size={24} color={theme.colors.primary} />
          {pacotinhos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pacotinhos}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>Abrir Pacote</Text>
        <Text style={styles.cardDesc}>Descubra novos craques</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/rewards' as any)}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="trophy" size={24} color={theme.colors.accent} />
        </View>
        <Text style={styles.cardTitle}>Recompensas</Text>
        <Text style={styles.cardDesc}>Resgate conquistas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cardTitle: {
    ...theme.typography.h3,
    fontSize: 14,
    marginBottom: 2,
  },
  cardDesc: {
    ...theme.typography.caption,
    textAlign: 'center',
    fontSize: 10,
  },
});
