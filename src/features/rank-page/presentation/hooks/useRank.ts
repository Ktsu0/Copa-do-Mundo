import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { RankData } from '../../domain/entities/Rank';
import { RankRepository } from '../../infrastructure/repositories/RankRepository';
import { GetRankDataUseCase } from '../../application/usecases/GetRankDataUseCase';

export function useRank() {
  const [data, setData] = useState<RankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRank = useCallback(async () => {
    try {
      setIsLoading(true);
      const repository = new RankRepository();
      const useCase = new GetRankDataUseCase(repository);
      const result = await useCase.execute();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rank data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // A tela de rank fica montada como aba: sem isso, ela so buscaria os
  // dados uma vez (no primeiro acesso) e nunca mais refletiria mudancas
  // feitas no Firestore enquanto o app ja estava aberto.
  useFocusEffect(
    useCallback(() => {
      fetchRank();
    }, [fetchRank])
  );

  return { data, isLoading, error };
}
