import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

// Trilho + preenchimento montados a mao em varios lugares (recompensas,
// album, resumo) com a mesma estrutura -- centralizado aqui.
export function ProgressBar({
  percentage, height = 4, trackColor = theme.colors.border, fillColor = theme.colors.primary, style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: fillColor, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  fill: {
    height: '100%',
  },
});
