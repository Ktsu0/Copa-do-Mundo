import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

function formatarDataNascimento(texto: string): string {
  const digits = texto.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function SignupScreen() {
  const { isSubmitting, error, cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastrar = async () => {
    const sucesso = await cadastrar({ nome, email, senha, dataNascimento });
    if (sucesso) {
      router.back();
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Criar Conta</Text>

        <AuthTextField
          label="NOME COMPLETO"
          icon="person-outline"
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
        <AuthTextField
          label="E-MAIL OU USUÁRIO"
          icon="mail-outline"
          placeholder="E-mail ou usuário"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthTextField
          label="DATA DE NASCIMENTO"
          icon="calendar-outline"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
          value={dataNascimento}
          onChangeText={(t) => setDataNascimento(formatarDataNascimento(t))}
        />
        <AuthTextField
          label="SENHA"
          icon="lock-closed-outline"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AuthPrimaryButton label="Cadastrar" onPress={handleCadastrar} loading={isSubmitting} />

        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  loginLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  loginLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
