import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { RankData } from '../../domain/entities/Rank';
import { RankRepository } from '../../infrastructure/repositories/RankRepository';
import { GetRankDataUseCase } from '../../application/usecases/GetRankDataUseCase';

export function useRank() {
  const [data, setData] = useState<RankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchRank = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setIsLoading(true);
      const repository = new RankRepository();
      const useCase = new GetRankDataUseCase(repository);
      const result = await useCase.execute();
      // Reentrar na aba rapido pode fazer um fetch antigo resolver depois
      // de um mais novo -- so aplica se ainda for o pedido mais recente.
      if (requestId !== requestIdRef.current) return;
      setData(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch rank data'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
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
