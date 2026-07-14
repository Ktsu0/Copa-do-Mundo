import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Profile } from '../../domain/entities/Profile';
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository';
import { GetProfileUseCase } from '../../application/usecases/GetProfileUseCase';
import { UpdateProfileNameUseCase } from '../../application/usecases/UpdateProfileNameUseCase';
import { UpdateProfileAvatarUseCase } from '../../application/usecases/UpdateProfileAvatarUseCase';
import { DeleteAccountUseCase } from '../../application/usecases/DeleteAccountUseCase';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (useAuthStore.getState().status !== 'authenticated') {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const repo = new ProfileRepository();
      const useCase = new GetProfileUseCase(repo);
      const result = await useCase.execute();
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar perfil.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
