import { useState, useEffect } from 'react';
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { mockTeamDetailRepository } from '../../infrastructure/repositories/mockTeamDetailRepository';
import { GetTeamDetailUseCase } from '../../application/usecases/GetTeamDetailUseCase';

export function useTeamDetail(teamId: string) {
  const [data, setData] = useState<TimeDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamDetail = async () => {
      try {
        setIsLoading(true);
        const useCase = new GetTeamDetailUseCase(mockTeamDetailRepository);
        const result = await useCase.execute(teamId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load team detail'));
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId) {
      fetchTeamDetail();
    }
  }, [teamId]);

  return { data, isLoading, error };
}
