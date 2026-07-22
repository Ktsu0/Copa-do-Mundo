import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { UsuarioFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useUsuarioAtual() {
  const status = useAuthStore((s) => s.status);
  const [usuario, setUsuario] = useState<UsuarioFirestore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchUsuario = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (status !== 'authenticated') {
      setUsuario(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await UsuarioRepository.getUsuario();
      if (requestId !== requestIdRef.current) return;
      setUsuario(data);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [status]);

  // Reage a mudanca de status (nao so ao foco): logo apos o login, o
  // onAuthStateChanged que atualiza esse status roda de forma assincrona e
  // pode chegar depois do foco da tela ja ter disparado o fetch anterior.
  useEffect(() => {
    fetchUsuario();
  }, [status, fetchUsuario]);

  useFocusEffect(
    useCallback(() => {
      fetchUsuario();
    }, [fetchUsuario])
  );

  return { usuario, isLoading, refetch: fetchUsuario };
}
