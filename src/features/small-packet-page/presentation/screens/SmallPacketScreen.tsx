import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Screen } from '@/shareds/presentation/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';
import { usePacket } from '../hooks/usePacket';
import { PacketCard } from '../components/PacketCard';
import { PacketRevealCards } from '../components/PacketRevealCards';

export function SmallPacketScreen() {
  const {
    pacotinhosDisponiveis, pacoteAtual, posicaoNaFila, totalNaFila,
    isLoading, openPackets, proximoPacote,
  } = usePacket();
  const [opened, setOpened] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const packetScale = useRef(new Animated.Value(1)).current;

  const animarRevelacao = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleOpen = async (quantidade: number) => {
    Animated.sequence([
      Animated.timing(packetScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(packetScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(packetScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(async () => {
      const resultados = await openPackets(quantidade);
      if (resultados && resultados.length > 0) {
        setOpened(true);
        animarRevelacao();
      }
    });
  };

  // Fecha o pacote atual e, se ainda houver mais na fila (abriu 5/10 de
  // uma vez), revela o proximo em sequencia -- so volta pro cartao
  // fechado quando todos ja foram mostrados.
  const handleCollect = () => {
    const temProximo = proximoPacote();
    if (temProximo) {
      animarRevelacao();
      return;
    }
    setOpened(false);
  };

  const mostrarRevelacao = opened && pacoteAtual;

  return (
    <Screen style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.packetsText}>
          {pacotinhosDisponiveis === 0 ? 'Nenhum' : pacotinhosDisponiveis}{' '}
          {pacotinhosDisponiveis === 1 ? 'pacote disponível' : 'pacotes disponíveis'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {!mostrarRevelacao ? (
          <PacketCard
            pacotinhosDisponiveis={pacotinhosDisponiveis}
            isLoading={isLoading}
            packetScale={packetScale}
            onOpen={handleOpen}
          />
        ) : (
          <PacketRevealCards
            cards={pacoteAtual.figurinhasGanhas}
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            onCollect={handleCollect}
            posicaoNaFila={posicaoNaFila}
            totalNaFila={totalNaFila}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1221',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  packetsText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
});
