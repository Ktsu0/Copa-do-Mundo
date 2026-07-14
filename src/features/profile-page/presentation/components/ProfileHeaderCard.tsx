import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';

interface ProfileHeaderCardProps {
  nome: string;
  email: string;
  avatarUrl: string;
  isSaving: boolean;
  onPressAvatar: () => void;
  onSaveNome: (nome: string) => void;
}

export function ProfileHeaderCard({ nome, email, avatarUrl, isSaving, onPressAvatar, onSaveNome }: ProfileHeaderCardProps) {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(nome);

  const iniciarEdicao = () => {
    setRascunho(nome);
    setEditando(true);
  };

  const confirmar = () => {
    setEditando(false);
    if (rascunho.trim() && rascunho.trim() !== nome) {
      onSaveNome(rascunho);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPressAvatar} style={styles.avatarWrapper} disabled={isSaving}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.editBadge}>
          <Ionicons name="camera" size={14} color="#0B1221" />
        </View>
      </TouchableOpacity>

      {editando ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.input}
            value={rascunho}
            onChangeText={setRascunho}
            autoFocus
            maxLength={40}
            onSubmitEditing={confirmar}
            placeholderTextColor={theme.colors.textMuted}
          />
          <TouchableOpacity onPress={confirmar} style={styles.confirmButton}>
            <Ionicons name="checkmark" size={20} color="#0B1221" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.nameRow} onPress={iniciarEdicao} disabled={isSaving}>
          <Text style={styles.nome}>{nome}</Text>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.accent} style={styles.pencil} />
          ) : (
            <Ionicons name="pencil" size={14} color={theme.colors.textMuted} style={styles.pencil} />
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.email}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nome: {
    ...theme.typography.h2,
  },
  pencil: {
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
  },
  input: {
    flex: 1,
    ...theme.typography.h3,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent,
    paddingVertical: 4,
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
});
