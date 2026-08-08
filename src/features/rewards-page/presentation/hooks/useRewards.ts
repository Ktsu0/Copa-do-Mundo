import { useState, useEffect, useCallback } from 'react';
import { Reward } from '../../domain/entities/Reward';
import { RewardRepository } from '../../infrastructure/repositories/RewardRepository';
import { GetRewardsUseCase } from '../../application/usecases/GetRewardsUseCase';
import { ClaimRewardUseCase } from '../../application/usecases/ClaimRewardUseCase';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      const repo = new RewardRepository();
      const useCase = new GetRewardsUseCase(repo);
      const result = await useCase.execute();
      setRewards(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load rewards'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lanca em caso de falha real -- quem chama (RewardsScreen) trata isso
  // separado de "ainda nao elegivel", que continua sendo um `false` normal.
  const claimReward = async (id: string) => {
    const repo = new RewardRepository();
    const useCase = new ClaimRewardUseCase(repo);
    const success = await useCase.execute(id);
    if (success) {
      await fetchRewards();
    }
    return success;
  };

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return { rewards, isLoading, error, claimReward, refetch: fetchRewards };
}
