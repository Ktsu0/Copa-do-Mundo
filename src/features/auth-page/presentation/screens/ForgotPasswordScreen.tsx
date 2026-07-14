import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { Ionicons } from '@expo/vector-icons';
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

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
            {error && <Text style={styles.errorText}>{error}</Text>}
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
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
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
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
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
