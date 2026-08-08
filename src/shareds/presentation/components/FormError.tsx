import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface FormErrorProps {
  message?: string | null;
}

// Texto de erro de formulario redefinido igual em varias telas de auth --
// centralizado aqui.
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
