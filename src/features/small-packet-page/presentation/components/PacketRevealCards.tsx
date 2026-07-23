import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { GanhaFigurinha } from '../../domain/entities/Packet';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const countryCodeMap: Record<string, string> = {
  ENG: 'gb-eng', SUI: 'ch', CRO: 'hr', POR: 'pt', GER: 'de', JPN: 'jp', MAR: 'ma',
  URU: 'uy', KOR: 'kr', IRN: 'ir', SEN: 'sn', USA: 'us', ARG: 'ar', FRA: 'fr',
  BRA: 'br', ESP: 'es', NED: 'nl', BEL: 'be', AUS: 'au', ECU: 'ec', CAN: 'ca',
  MEX: 'mx', TUN: 'tn', CPV: 'cv', SWE: 'se', GHA: 'gh',
};

function getFlagUrl(timeId: string) {
  const cc = countryCodeMap[timeId] ?? timeId.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${cc}.png`;
}

interface PacketRevealCardsProps {
  cards: GanhaFigurinha[];
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onCollect: () => void;
  posicaoNaFila?: number;
  totalNaFila?: number;
}

export function PacketRevealCards({
  cards, fadeAnim, scaleAnim, onCollect, posicaoNaFila = 1, totalNaFila = 1,
}: PacketRevealCardsProps) {
  const ehUltimo = posicaoNaFila >= totalNaFila;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {totalNaFila > 1 && (
        <Text style={styles.contador}>PACOTE {posicaoNaFila} DE {totalNaFila}</Text>
      )}
      <Text style={styles.congrats}>PARABÉNS !</Text>
      <Text style={styles.congratsSub}>VOCÊ GANHOU 3 FIGURINHAS</Text>

      <View style={styles.cardsRow}>
        {cards.map((card, idx) => {
          const isCenter = idx === 1;
          return (
            <View
              key={card.id + '_' + idx}
              style={[
                styles.card,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                isCenter && styles.cardCenter,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.pos}>{card.posicao}</Text>
                <Image source={{ uri: getFlagUrl(card.timeId) }} style={styles.flag} />
              </View>

              <View style={styles.avatarArea}>
                {card.fotoUrl ? (
                  <Image source={{ uri: card.fotoUrl }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={48} color={theme.colors.border} />
                )}
              </View>

              <View style={[styles.nameContainer, { backgroundColor: theme.colors.border }]}>
                <Text style={styles.name} numberOfLines={1}>{card.jogadorNome.toUpperCase()}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Ionicons name="trophy" size={10} color={theme.colors.accent} />
                <Text style={styles.cardFooterText}>WORLD CUP 2026</Text>
              </View>

              {card.isNew && (
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>NOVA!</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={onCollect}>
        <Text style={styles.buttonText}>{ehUltimo ? 'TOQUE PARA RECOLHER' : 'PRÓXIMO PACOTE'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  contador: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: theme.spacing.sm },
  congrats: { fontSize: 28, fontWeight: '900', color: theme.colors.accent, letterSpacing: 2 },
  congratsSub: { fontSize: 12, fontWeight: '700', color: theme.colors.accent, letterSpacing: 1, marginTop: 4, marginBottom: theme.spacing.xxl },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    borderWidth: 2,
    padding: 6,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cardCenter: { transform: [{ scale: 1.15 }], zIndex: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pos: { fontSize: 8, color: theme.colors.textMuted, fontWeight: '700' },
  flag: { width: 14, height: 10, borderRadius: 1 },
  avatarArea: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 4 },
  nameContainer: { borderRadius: 2, paddingVertical: 2, paddingHorizontal: 4, alignItems: 'center', marginVertical: 4 },
  name: { fontSize: 9, fontWeight: '900', color: '#0B1221' },
  cardFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 },
  cardFooterText: { fontSize: 6, fontWeight: '600', color: theme.colors.text },
  newTag: { position: 'absolute', top: 4, right: 4, backgroundColor: '#00B873', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  newTagText: { fontSize: 6, fontWeight: '900', color: '#FFFFFF' },
  button: {
    backgroundColor: '#3b82f6',
    width: width * 0.65,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonText: { ...theme.typography.body, fontWeight: '800', color: '#0B1221', letterSpacing: 1 },
});
