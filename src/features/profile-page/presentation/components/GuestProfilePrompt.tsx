import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

export function GuestProfilePrompt() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={72} color={theme.colors.textMuted} />
      <Text style={styles.title}>Você não está logado</Text>
      <Text style={styles.subtitle}>Faça login para ver seus pontos, álbum e conquistas.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Fazer login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: '#0B1221',
  },
});
