import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function AuthTextField({ label, icon, style, ...props }: AuthTextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 16,
  },
});
