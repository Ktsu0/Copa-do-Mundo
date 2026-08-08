import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/shareds/infrastructure/firebase/firebaseClient';
import { theme } from '@/shareds/presentation/constants/theme';

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      router.replace('/(tabs)');
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut} disabled={isSigningOut}>
      {isSigningOut ? (
        <ActivityIndicator size="small" color={theme.colors.textMuted} />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.textMuted} />
          <Text style={styles.buttonText}>Sair</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xl,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
});
