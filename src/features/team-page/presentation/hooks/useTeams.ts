import { useCallback, useEffect, useState } from 'react';
import { TimeResumo } from '../../domain/entities/TimeResumo';
import { mockTeamRepository } from '../../infrastructure/repositories/mockTeamRepository';
import { GetTeamsUseCase } from '../../application/usecases/GetTeamsUseCase';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { useAsyncData } from '@/shareds/presentation/hooks/useAsyncData';

const fetchTeams = () => new GetTeamsUseCase(mockTeamRepository).execute();

export function useTeams() {
  const { data: fetched, isLoading, error } = useAsyncData<TimeResumo[]>(fetchTeams, [], []);

  // Copia local por cima do resultado do useAsyncData -- so ela sofre a
  // atualizacao otimista de toggleFavorito, sem precisar de um setter
  // exposto pelo hook compartilhado.
  const [data, setData] = useState<TimeResumo[]>(fetched);
  useEffect(() => {
    setData(fetched);
  }, [fetched]);

  // Atualiza a UI na hora (otimista) e so depois confirma com o Firestore --
  // se a escrita falhar, desfaz o estado local.
  const toggleFavorito = useCallback(async (id: string) => {
    setData((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorito: !t.isFavorito } : t)));
    try {
      await UsuarioRepository.toggleTimeFavorito(id);
    } catch (err) {
      setData((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorito: !t.isFavorito } : t)));
      throw err;
    }
  }, []);

  return { data, isLoading, error, toggleFavorito };
}
