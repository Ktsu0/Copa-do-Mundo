import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Profile } from '../../domain/entities/Profile';
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository';
import { GetProfileUseCase } from '../../application/usecases/GetProfileUseCase';
import { UpdateProfileNameUseCase } from '../../application/usecases/UpdateProfileNameUseCase';
import { UpdateProfileAvatarUseCase } from '../../application/usecases/UpdateProfileAvatarUseCase';
import { DeleteAccountUseCase } from '../../application/usecases/DeleteAccountUseCase';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useProfile() {
  const status = useAuthStore((s) => s.status);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // O foco da tela e a mudanca de status de auth podem disparar fetchProfile
  // quase ao mesmo tempo (ex: logo apos o login). Sem essa trava, a resposta
  // da chamada mais antiga pode chegar depois da mais nova e sobrescrever um
  // perfil ja carregado corretamente com um resultado desatualizado.
  const requestIdRef = useRef(0);

  const fetchProfile = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (status !== 'authenticated') {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const repo = new ProfileRepository();
      const useCase = new GetProfileUseCase(repo);
      const result = await useCase.execute();
      if (requestId !== requestIdRef.current) return;
      setProfile(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Erro ao carregar perfil.'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [status]);

  // Alem do foco da tela, refaz a busca sempre que o status de auth mudar:
  // o login navega de volta para o Perfil via router.back() logo apos o
  // signInWithEmailAndPassword resolver, mas o listener onAuthStateChanged
  // (que atualiza esse status) roda de forma assincrona e pode nao ter
  // disparado ainda nesse momento -- sem isso, o fetch de foco roda cedo
  // demais, encontra status 'guest' e trava o perfil em branco/zerado.
  useEffect(() => {
    fetchProfile();
  }, [status, fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const updateNome = async (nome: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      const repo = new ProfileRepository();
      const useCase = new UpdateProfileNameUseCase(repo);
      await useCase.execute(nome);
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao atualizar nome.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAvatar = async (avatarUrl: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      const repo = new ProfileRepository();
      const useCase = new UpdateProfileAvatarUseCase(repo);
      await useCase.execute(avatarUrl);
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao atualizar avatar.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      const repo = new ProfileRepository();
      const useCase = new DeleteAccountUseCase(repo);
      await useCase.execute();
      setProfile(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao excluir conta.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile, isLoading, isSaving, error,
    updateNome, updateAvatar, deleteAccount,
    refetch: fetchProfile,
  };
}
