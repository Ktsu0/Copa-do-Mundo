import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

export function LoginScreen() {
  const { isSubmitting, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    const sucesso = await login(email, senha);
    if (sucesso) {
      router.back();
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../../../assets/images/logo-glow.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>
          Vivencie a emoção do futebol de alto nível. Junte-se ao ArenaX hoje.
        </Text>

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
          label="SENHA"
          icon="lock-closed-outline"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AuthPrimaryButton label="Entrar" onPress={handleLogin} loading={isSubmitting} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        <AuthPrimaryButton label="Criar Conta" variant="secondary" onPress={() => router.push('/signup')} />

        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotLink}>
          <Text style={styles.forgotLinkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 160,
    height: 160,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    marginHorizontal: theme.spacing.md,
  },
  forgotLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  forgotLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
});
