import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';

interface DangerZoneCardProps {
  isSaving: boolean;
  onConfirmDelete: () => void;
}

export function DangerZoneCard({ isSaving, onConfirmDelete }: DangerZoneCardProps) {
  const handlePress = () => {
    Alert.alert(
      'Excluir conta',
      'Isso vai apagar permanentemente seus pontos, palpites, álbum e conquistas. Essa ação não pode ser desfeita. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir conta', style: 'destructive', onPress: onConfirmDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={isSaving}>
        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        <Text style={styles.buttonText}>Excluir conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '700',
  },
});
