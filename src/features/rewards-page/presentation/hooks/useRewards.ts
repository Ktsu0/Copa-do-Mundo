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

  const claimReward = async (id: string) => {
    try {
      const repo = new RewardRepository();
      const useCase = new ClaimRewardUseCase(repo);
      const success = await useCase.execute(id);
      if (success) {
        await fetchRewards();
      }
      return success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return { rewards, isLoading, error, claimReward, refetch: fetchRewards };
}
