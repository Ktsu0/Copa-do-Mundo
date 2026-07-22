import { useState, useCallback } from 'react';
import { GroupSchedule } from '../../domain/entities/GroupSchedule';
import { MatchScheduleRepository } from '../../infrastructure/repositories/MatchScheduleRepository';
import { GetGroupScheduleUseCase } from '../../application/usecases/GetGroupScheduleUseCase';
import { useFocusEffect } from 'expo-router';

export function useGroupSchedule(grupo: string) {
  const [data, setData] = useState<GroupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!grupo) return;
      const fetch = async () => {
        try {
          setIsLoading(true);
          const repo = new MatchScheduleRepository();
          const useCase = new GetGroupScheduleUseCase(repo);
          const result = await useCase.execute(grupo);
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Erro ao carregar dados do grupo.'));
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }, [grupo])
  );

  return { data, isLoading, error };
}
