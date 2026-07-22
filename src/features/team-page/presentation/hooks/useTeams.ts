import { useState, useEffect } from 'react';
import { TimeResumo } from '../../domain/entities/TimeResumo';
import { mockTeamRepository } from '../../infrastructure/repositories/mockTeamRepository';
import { GetTeamsUseCase } from '../../application/usecases/GetTeamsUseCase';

export function useTeams() {
  const [data, setData] = useState<TimeResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const useCase = new GetTeamsUseCase(mockTeamRepository);
        const result = await useCase.execute();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load teams'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return { data, isLoading, error };
}
