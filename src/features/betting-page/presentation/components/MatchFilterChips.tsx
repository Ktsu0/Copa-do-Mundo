import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';
import { MatchFilter } from '../../domain/entities/Match';

interface MatchFilterChipsProps {
  selected: MatchFilter;
  onSelect: (f: MatchFilter) => void;
}

const FILTERS: { key: MatchFilter; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'dezesseis_avos', label: 'Fase de Grupos' },
  { key: 'oitavas', label: 'Oitavas de Final' },
];

// Antes era um ScrollView horizontal: com 3 filtros e telas estreitas, os
// dois ultimos ficavam cortados/apertados fora da area visivel. Como sao
// so 3 opcoes, cada chip agora ocupa 1/3 da largura (flex: 1) e o texto
// encolhe pra caber em vez de cortar.
export function MatchFilterChips({ selected, onSelect }: MatchFilterChipsProps) {
  return (
    <View style={styles.container}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.key}
          style={[styles.chip, selected === f.key && styles.chipSelected]}
          onPress={() => onSelect(f.key)}
        >
          <Text
            style={[styles.chipText, selected === f.key && styles.chipTextSelected]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  chip: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  chipTextSelected: {
    color: '#0B1221',
    fontWeight: '700',
  },
});
