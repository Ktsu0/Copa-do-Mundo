import React from 'react';
import { View, ViewProps, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

// Estilo de card (fundo + raio + borda) que varios componentes espalhados
// pelo app reimplementavam copiado -- exportado separado pra quem precisa
// aplicar num TouchableOpacity/Pressable em vez de um View puro.
export const cardBaseStyle: ViewStyle = {
  backgroundColor: theme.colors.card,
  borderRadius: theme.radius.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
};

interface CardProps extends ViewProps {
  style?: ViewProps['style'];
}

export function Card({ style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: cardBaseStyle,
});
