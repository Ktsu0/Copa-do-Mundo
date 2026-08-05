import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { HomeData } from '../../domain/entities/HomeData';
import { HomeRepository } from '../../infrastructure/repositories/HomeRepository';
import { GetHomeDataUseCase } from '../../application/usecases/GetHomeDataUseCase';

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const requestId = ++requestIdRef.current;
      const fetch = async () => {
        try {
          setIsLoading(true);
          const repo = new HomeRepository();
          const useCase = new GetHomeDataUseCase(repo);
          const result = await useCase.execute();
          // Reentrar na Home rapido pode fazer um fetch antigo resolver
          // depois de um mais novo -- so aplica se ainda for o mais recente.
          if (requestId !== requestIdRef.current) return;
          setData(result);
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          setError(err instanceof Error ? err : new Error('Erro ao carregar home.'));
        } finally {
          if (requestId === requestIdRef.current) setIsLoading(false);
        }
      };
      fetch();
    }, [])
  );

  return { data, isLoading, error };
}
