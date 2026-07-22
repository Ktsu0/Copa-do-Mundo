import { IRewardRepository } from '../../domain/repositories/IRewardRepository';
import { Reward } from '../../domain/entities/Reward';

export class GetRewardsUseCase {
  constructor(private repository: IRewardRepository) {}

  async execute(): Promise<Reward[]> {
    return this.repository.getRewards();
  }
}
