import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

// Botao de voltar (36x36 + seta) copiado igual em varias telas de
// auth/perfil -- centralizado aqui.
export function BackButton({ onPress, color = theme.colors.text, size = 22, style }: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
});
