import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { BackButton } from '@/shareds/presentation/components/BackButton';
import { FormError } from '@/shareds/presentation/components/FormError';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

export function ForgotPasswordScreen() {
  const { isSubmitting, error, redefinirSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    const sucesso = await redefinirSenha(email);
    if (sucesso) {
      setEnviado(true);
    }
  };

  return (
    <Screen>
      <View style={styles.content}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.title}>Esqueceu sua senha?</Text>

        {enviado ? (
          <Text style={styles.successText}>
            Enviamos um link de redefinição de senha para {email}. Verifique sua caixa de entrada e clique no link para criar uma nova senha.
          </Text>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Informe o e-mail da sua conta. Vamos te enviar um link para redefinir a senha.
            </Text>
            <AuthTextField
              label="E-MAIL"
              icon="mail-outline"
              placeholder="Seu e-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <FormError message={error} />
            <AuthPrimaryButton label="Enviar link de redefinição" onPress={handleEnviar} loading={isSubmitting} />
          </>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  successText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  loginLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
