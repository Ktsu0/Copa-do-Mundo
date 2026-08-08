import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, BackHandler } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { BackButton } from '@/shareds/presentation/components/BackButton';
import { FormError } from '@/shareds/presentation/components/FormError';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

// A tela de login pode ser aberta via `router.replace` (RequireAuthScreen),
// que nao deixa historico pra voltar. Sem isso, o botao voltar (na tela e o
// fisico/gesto do Android) nao tem destino e fica sem fazer nada.
function goBackOrHome() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export function LoginScreen() {
  const { isSubmitting, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBackOrHome();
        return true;
      });
      return () => subscription.remove();
    }, [])
  );

  const handleLogin = async () => {
    const sucesso = await login(email, senha);
    if (sucesso) {
      goBackOrHome();
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <BackButton onPress={goBackOrHome} />

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

        <FormError message={error} />

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
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  logo: {
    width: 132,
    height: 132,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
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
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  forgotLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
});
