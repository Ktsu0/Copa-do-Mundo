import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { QUANTIDADES_ABERTURA } from '../../domain/entities/Packet';
import pacoteImage from '../../../../../assets/pacote.png';

const { width } = Dimensions.get('window');
const PACOTE_ASPECT_RATIO = 338 / 450;

interface PacketCardProps {
  pacotinhosDisponiveis: number;
  isLoading: boolean;
  packetScale: Animated.Value;
  onOpen: (quantidade: number) => void;
}

export function PacketCard({ pacotinhosDisponiveis, isLoading, packetScale, onOpen }: PacketCardProps) {
  const opcoesDisponiveis = QUANTIDADES_ABERTURA.filter(q => q <= pacotinhosDisponiveis);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.packetGlow, { transform: [{ scale: packetScale }] }]}>
        <Image source={pacoteImage} style={styles.packetImage} contentFit="contain" />
      </Animated.View>

      {isLoading ? (
        <View style={[styles.optionButton, styles.optionButtonDisabled]}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : opcoesDisponiveis.length === 0 ? (
        <View style={[styles.optionButton, styles.optionButtonDisabled]}>
          <Text style={styles.optionButtonTextDisabled}>SEM PACOTES</Text>
        </View>
      ) : (
        <View style={styles.optionsRow}>
          {opcoesDisponiveis.map((quantidade) => (
            <TouchableOpacity
              key={quantidade}
              style={[styles.optionButton, quantidade === 10 && styles.optionButtonDestaque]}
              onPress={() => onOpen(quantidade)}
              activeOpacity={0.85}
            >
              <Ionicons name="albums" size={16} color="#0B1221" />
              <Text style={styles.optionButtonText}>ABRIR {quantidade}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  packetGlow: {
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  packetImage: {
    width: width * 0.66,
    aspectRatio: PACOTE_ASPECT_RATIO,
    borderRadius: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.xl,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  optionButtonDestaque: {
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  optionButtonDisabled: {
    backgroundColor: theme.colors.cardHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: theme.spacing.xl,
  },
  optionButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '800',
    color: '#0B1221',
    letterSpacing: 0.5,
  },
  optionButtonTextDisabled: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
});
