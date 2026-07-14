import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';
import { AVATARES_DISPONIVEIS } from '../../domain/entities/Profile';

interface AvatarPickerModalProps {
  visible: boolean;
  avatarAtual: string;
  onSelect: (avatarUrl: string) => void;
  onClose: () => void;
}

export function AvatarPickerModal({ visible, avatarAtual, onSelect, onClose }: AvatarPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Escolha seu avatar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={AVATARES_DISPONIVEIS}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              const selecionado = item === avatarAtual;
              return (
                <TouchableOpacity
                  style={[styles.avatarButton, selecionado && styles.avatarButtonSelected]}
                  onPress={() => onSelect(item)}
                >
                  <Image source={{ uri: item }} style={styles.avatarImage} contentFit="cover" />
                  {selecionado && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    gap: 12,
  },
  avatarButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    maxWidth: '22%',
  },
  avatarButtonSelected: {
    borderColor: theme.colors.accent,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
  },
});
