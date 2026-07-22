import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { HomeData } from '../../domain/entities/HomeData';
import { HomeRepository } from '../../infrastructure/repositories/HomeRepository';
import { GetHomeDataUseCase } from '../../application/usecases/GetHomeDataUseCase';

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        try {
          setIsLoading(true);
          const repo = new HomeRepository();
          const useCase = new GetHomeDataUseCase(repo);
          const result = await useCase.execute();
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Erro ao carregar home.'));
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }, [])
  );

  return { data, isLoading, error };
}
