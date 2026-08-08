import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { Jogador } from '../../domain/entities/TimeDetalhe';
import { theme } from '@/shareds/presentation/constants/theme';
import { Card } from '@/shareds/presentation/components/Card';

interface SquadListProps {
  elenco: Jogador[];
}

export function SquadList({ elenco }: SquadListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Elenco</Text>
      </View>
      
      {elenco.map(jogador => (
        <Card key={jogador.id} style={styles.playerCard}>
          <Image source={{ uri: jogador.fotoUrl }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{jogador.nome}</Text>
            <Text style={styles.position}>{jogador.posicao}</Text>
          </View>
          <View style={styles.numberBadge}>
            <Text style={styles.number}>{jogador.numero}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  position: {
    ...theme.typography.caption,
  },
  numberBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  number: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
  }
});
