import { IRewardRepository } from '../../domain/repositories/IRewardRepository';

export class ClaimRewardUseCase {
  constructor(private repository: IRewardRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.claimReward(id);
  }
}
