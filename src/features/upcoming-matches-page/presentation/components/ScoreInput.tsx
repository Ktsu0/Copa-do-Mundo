import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';

interface ScoreInputProps {
  labelCasa: string;
  labelFora: string;
  scoreCasa: number;
  scoreFora: number;
  onChangeCasa: (v: number) => void;
  onChangeFora: (v: number) => void;
  disabled?: boolean;
}

function Counter({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <View style={styles.counterRow}>
      <TouchableOpacity
        style={[styles.counterBtn, disabled && styles.counterBtnDisabled]}
        onPress={() => !disabled && onChange(Math.max(0, value - 1))}
        disabled={disabled}
      >
        <Text style={styles.counterBtnText}>−</Text>
      </TouchableOpacity>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{value}</Text>
      </View>
      <TouchableOpacity
        style={[styles.counterBtn, disabled && styles.counterBtnDisabled]}
        onPress={() => !disabled && onChange(value + 1)}
        disabled={disabled}
      >
        <Text style={styles.counterBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ScoreInput({
  labelCasa, labelFora, scoreCasa, scoreFora,
  onChangeCasa, onChangeFora, disabled,
}: ScoreInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SEU PLACAR FINAL</Text>
      <View style={styles.row}>
        <View style={styles.side}>
          <Counter value={scoreCasa} onChange={onChangeCasa} disabled={disabled} />
          <Text style={styles.teamLabel}>{labelCasa}</Text>
        </View>
        <Text style={styles.vsX}>×</Text>
        <View style={styles.side}>
          <Counter value={scoreFora} onChange={onChangeFora} disabled={disabled} />
          <Text style={styles.teamLabel}>{labelFora}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  side: {
    alignItems: 'center',
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 22,
  },
  scoreBox: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.h1,
    fontSize: 28,
  },
  teamLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  vsX: {
    ...theme.typography.h2,
    color: theme.colors.textMuted,
    alignSelf: 'center',
    marginTop: -20,
  },
});
