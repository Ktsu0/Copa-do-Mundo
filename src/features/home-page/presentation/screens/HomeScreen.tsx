import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { HeaderWidget } from '@/shareds/presentation/components/HeaderWidget';
import { theme } from '@/shareds/presentation/constants/theme';
import { useHomeData } from '../hooks/useHomeData';
import { DailyRewardBanner } from '../components/DailyRewardBanner';
import { FeaturedMatchCard } from '../components/FeaturedMatchCard';

export function HomeScreen() {
  const { data, isLoading } = useHomeData();

  if (isLoading || !data) {
    return (
      <Screen style={styles.centered} edges={['top', 'left', 'right']}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen noPadding edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <HeaderWidget />
        </View>

        <DailyRewardBanner reward={data.dailyReward} />

        {data.featuredMatch && (
          <FeaturedMatchCard match={data.featuredMatch} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.md,
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
});
