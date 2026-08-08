import { useCallback } from 'react';
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { mockTeamDetailRepository } from '../../infrastructure/repositories/mockTeamDetailRepository';
import { GetTeamDetailUseCase } from '../../application/usecases/GetTeamDetailUseCase';
import { useAsyncData } from '@/shareds/presentation/hooks/useAsyncData';

export function useTeamDetail(teamId: string) {
  const fetcher = useCallback(() => {
    const useCase = new GetTeamDetailUseCase(mockTeamDetailRepository);
    return useCase.execute(teamId);
  }, [teamId]);

  return useAsyncData<TimeDetalhe | null>(fetcher, [teamId], null);
}
