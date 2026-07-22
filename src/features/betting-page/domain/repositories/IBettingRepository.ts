import { Match, MatchFilter } from '../entities/Match';

export interface IBettingRepository {
  getMatches(filtro: MatchFilter): Promise<Match[]>;
}
