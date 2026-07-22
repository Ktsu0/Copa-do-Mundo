import { RankData } from '../../domain/entities/Rank';
import { RankRepository } from '../../infrastructure/repositories/RankRepository';

export class GetRankDataUseCase {
  constructor(private rankRepository: RankRepository) {}

  async execute(): Promise<RankData> {
    return this.rankRepository.getRankData();
  }
}
