import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { MatchDetail } from '../../domain/entities/Bet';

export class GetMatchForBetUseCase {
  constructor(private repository: IBetRepository) {}

  async execute(jogoId: string): Promise<MatchDetail | null> {
    return this.repository.getMatchForBet(jogoId);
  }
}
