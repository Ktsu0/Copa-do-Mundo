import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'secondary' && styles.buttonSecondary, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.colors.text : theme.colors.background} />
      ) : (
        <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: theme.colors.background,
    letterSpacing: 0.5,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
});
