import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';
import { BetChoice } from '../../domain/entities/Bet';

interface OptionSelectorProps {
  label: string;
  labelCasa: string;
  labelFora: string;
  selected: BetChoice | null;
  onSelect: (choice: BetChoice) => void;
  disabled?: boolean;
}

export function OptionSelector({
  label, labelCasa, labelFora, selected, onSelect, disabled,
}: OptionSelectorProps) {
  const options: { key: BetChoice; text: string }[] = [
    { key: 'casa', text: labelCasa.toUpperCase() },
    { key: 'empate', text: 'EMPATE' },
    { key: 'fora', text: labelFora.toUpperCase() },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.chip,
              selected === opt.key && styles.chipSelected,
              disabled && styles.chipDisabled,
            ]}
            onPress={() => !disabled && onSelect(opt.key)}
            disabled={disabled}
          >
            <Text style={[styles.chipText, selected === opt.key && styles.chipTextSelected]}>
              {opt.text}
            </Text>
          </TouchableOpacity>
        ))}
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
    letterSpacing: 0.5,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '800',
    color: theme.colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  chipTextSelected: {
    color: '#0B1221',
  },
});
