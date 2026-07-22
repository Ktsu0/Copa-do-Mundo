import { Reward } from '../entities/Reward';

export interface IRewardRepository {
  getRewards(): Promise<Reward[]>;
  claimReward(id: string): Promise<boolean>;
}
