import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';
import { Standing } from '../../domain/entities/GroupSchedule';

interface GroupStandingsTableProps {
  standings: Standing[];
}

export function GroupStandingsTable({ standings }: GroupStandingsTableProps) {
  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.row}>
        <Text style={[styles.colHeader, styles.colPos]}>POS</Text>
        <Text style={[styles.colHeader, styles.colTeam]}>SELEÇÃO</Text>
        <Text style={[styles.colHeader, styles.colData]}>P</Text>
        <Text style={[styles.colHeader, styles.colData]}>J</Text>
        <Text style={[styles.colHeader, styles.colData]}>V</Text>
        <Text style={[styles.colHeader, styles.colData]}>E</Text>
        <Text style={[styles.colHeader, styles.colData]}>D</Text>
        <Text style={[styles.colHeader, styles.colData]}>SG</Text>
      </View>

      {/* Data Rows */}
      {standings.map((s, index) => {
        const isTop2 = index < 2;
        return (
          <View key={s.timeId} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={styles.colPos}>
              <View style={[styles.posBadge, isTop2 ? styles.posBadgeQualify : styles.posBadgeOut]}>
                <Text style={styles.posText}>{s.posicao}</Text>
              </View>
            </View>
            
            <View style={styles.colTeam}>
              <Image source={{ uri: s.bandeira }} style={styles.flag} />
              <Text style={styles.teamName} numberOfLines={1}>{s.nome.substring(0, 3).toUpperCase()}</Text>
            </View>
            
            <Text style={[styles.colData, styles.points]}>{s.pontos}</Text>
            <Text style={styles.colData}>{s.jogos}</Text>
            <Text style={styles.colData}>{s.vitorias}</Text>
            <Text style={styles.colData}>{s.empates}</Text>
            <Text style={styles.colData}>{s.derrotas}</Text>
            <Text style={styles.colData}>{s.saldoGols}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  colPos: { width: 32, alignItems: 'center' },
  colTeam: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
  colData: { width: 28, textAlign: 'center', ...theme.typography.bodySmall, color: theme.colors.textMuted },
  colHeader: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  posBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBadgeQualify: { backgroundColor: theme.colors.primary },
  posBadgeOut: { backgroundColor: theme.colors.border },
  posText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  flag: { width: 24, height: 16, borderRadius: 2, marginRight: 8 },
  teamName: { ...theme.typography.bodySmall, color: theme.colors.text, fontWeight: '600' },
  points: { color: theme.colors.text, fontWeight: '800' },
});
