import { useState, useCallback, useRef } from 'react';
import { GroupSchedule } from '../../domain/entities/GroupSchedule';
import { MatchScheduleRepository } from '../../infrastructure/repositories/MatchScheduleRepository';
import { GetGroupScheduleUseCase } from '../../application/usecases/GetGroupScheduleUseCase';
import { useFocusEffect } from 'expo-router';

export function useGroupSchedule(grupo: string) {
  const [data, setData] = useState<GroupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!grupo) return;
      const requestId = ++requestIdRef.current;
      const fetch = async () => {
        try {
          setIsLoading(true);
          const repo = new MatchScheduleRepository();
          const useCase = new GetGroupScheduleUseCase(repo);
          const result = await useCase.execute(grupo);
          // Trocar de grupo rapido pode fazer um fetch antigo resolver
          // depois de um mais novo -- so aplica se ainda for o mais recente.
          if (requestId !== requestIdRef.current) return;
          setData(result);
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          setError(err instanceof Error ? err : new Error('Erro ao carregar dados do grupo.'));
        } finally {
          if (requestId === requestIdRef.current) setIsLoading(false);
        }
      };
      fetch();
    }, [grupo])
  );

  return { data, isLoading, error };
}
