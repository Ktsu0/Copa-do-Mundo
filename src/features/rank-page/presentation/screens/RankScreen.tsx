import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRank } from '../hooks/useRank';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function RankScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useRank();
  const status = useAuthStore((s) => s.status);

  if (isLoading) {
    return (
      <Screen style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Erro ao carregar ranking.</Text>
      </Screen>
    );
  }

  return (
    <Screen noPadding edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* Podium */}
        <View style={styles.podiumContainer}>
          {data.topPlayers.map((player) => {
            const isFirst = player.position === 1;
            const size = isFirst ? 100 : 70;
            const color = player.color || theme.colors.border;
            
            return (
              <View key={player.id} style={[styles.podiumItem, isFirst && styles.podiumFirst]}>
                {isFirst && (
                  <View style={styles.crownContainer}>
                    <Ionicons name="ribbon" size={24} color={color} />
                  </View>
                )}
                <View>
                  <Image
                    source={{ uri: player.avatar }}
                    style={[
                      styles.podiumAvatar,
                      { width: size, height: size, borderRadius: size / 2, borderColor: color }
                    ]}
                  />
                  <View style={[
                    styles.positionBadge, 
                    { backgroundColor: color },
                    isFirst ? styles.positionBadgeFirst : styles.positionBadgeOther
                  ]}>
                    <Text style={styles.positionText}>{player.position}º</Text>
                  </View>
                </View>
                <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>{player.name}</Text>
                <Text style={[styles.podiumPoints, isFirst ? { color: color } : { color: theme.colors.primary }]} numberOfLines={1}>{player.points}</Text>
              </View>
            );
          })}
        </View>

        {/* Current User Card */}
        {status === 'authenticated' ? (
          <View style={styles.currentUserCard}>
            <View style={styles.currentUserPositionInfo}>
              <Text style={styles.currentUserLabel}>SUA POSIÇÃO</Text>
              <Text style={styles.currentUserPositionText}>#{data.currentUser.position.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.currentUserInfo}>
              <Image source={{ uri: data.currentUser.avatar }} style={styles.currentUserAvatar} />
              <Text style={styles.currentUserName}>{data.currentUser.name}</Text>
            </View>
            <Text style={styles.currentUserPoints}>{data.currentUser.points}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.guestCard} onPress={() => router.push('/login')}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.guestCardText}>Faça login para ver sua posição</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* List Header */}
        <Text style={styles.listHeader}>TOP 4 - 10</Text>

        {/* Remaining List */}
        <View style={styles.listContainer}>
          {data.otherPlayers.map(player => (
            <View key={player.id} style={styles.listItem}>
              <Text style={styles.listPosition}>{player.position}</Text>
              <Image source={{ uri: player.avatar }} style={styles.listAvatar} />
              <Text style={styles.listName}>{player.name}</Text>
              <Text style={styles.listPoints}>{player.points}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  podiumItem: {
    alignItems: 'center',
    width: 88,
    marginHorizontal: theme.spacing.xs,
  },
  podiumFirst: {
    width: 108,
    marginBottom: theme.spacing.md,
    zIndex: 2,
  },
  crownContainer: {
    position: 'absolute',
    top: -30,
    zIndex: 3,
  },
  podiumAvatar: {
    borderWidth: 3,
  },
  positionBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  positionBadgeFirst: {
    bottom: -8,
    alignSelf: 'center',
  },
  positionBadgeOther: {
    bottom: -4,
    right: -4,
  },
  positionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000', // Dark text on light badge
  },
  podiumName: {
    ...theme.typography.body,
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    width: '100%',
    textAlign: 'center',
  },
  podiumNameFirst: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  podiumPoints: {
    ...theme.typography.caption,
    marginTop: 2,
    width: '100%',
    textAlign: 'center',
  },
  currentUserCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentUserPositionInfo: {
    alignItems: 'flex-start',
    marginRight: theme.spacing.md,
  },
  currentUserLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  currentUserPositionText: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  currentUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  currentUserName: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  currentUserPoints: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  guestCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guestCardText: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
    fontWeight: '600',
  },
  listHeader: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContainer: {
    marginHorizontal: theme.spacing.md,
  },
  listItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listPosition: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    width: 24,
    textAlign: 'center',
    marginRight: theme.spacing.sm,
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.md,
  },
  listName: {
    ...theme.typography.body,
    flex: 1,
    fontWeight: '500',
  },
  listPoints: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
