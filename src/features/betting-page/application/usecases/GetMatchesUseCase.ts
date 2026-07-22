import { IBettingRepository } from '../../domain/repositories/IBettingRepository';
import { Match, MatchFilter } from '../../domain/entities/Match';

export class GetMatchesUseCase {
  constructor(private repository: IBettingRepository) {}

  async execute(filtro: MatchFilter): Promise<Match[]> {
    return this.repository.getMatches(filtro);
  }
}
