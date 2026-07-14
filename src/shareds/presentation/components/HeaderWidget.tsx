import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';

export function HeaderWidget() {
  const status = useAuthStore((s) => s.status);
  const { usuario } = useUsuarioAtual();
  const isAuthenticated = status === 'authenticated';

  const userName = isAuthenticated ? usuario?.nome ?? 'Jogador' : 'Visitante';
  const points = isAuthenticated ? usuario?.pontos ?? 0 : 0;
  const avatarUrl = isAuthenticated ? usuario?.foto_url : undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftSection} onPress={() => router.push('/profile')}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={theme.colors.textMuted}
            style={styles.avatarIcon}
          />
        )}
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{points.toLocaleString('en-US')} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarIcon: {
    marginRight: theme.spacing.sm,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
  pointsBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  pointsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
