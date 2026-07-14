import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { UsuarioFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useUsuarioAtual() {
  const [usuario, setUsuario] = useState<UsuarioFirestore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsuario = useCallback(async () => {
    if (useAuthStore.getState().status !== 'authenticated') {
      setUsuario(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await UsuarioRepository.getUsuario();
      setUsuario(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsuario();
    }, [fetchUsuario])
  );

  return { usuario, isLoading, refetch: fetchUsuario };
}
