import { Bet, MatchDetail } from '../entities/Bet';

export interface IBetRepository {
  getMatchForBet(jogoId: string): Promise<MatchDetail | null>;
  getBetForMatch(jogoId: string): Promise<Bet | null>;
  isUsuarioMaiorDeIdade(): Promise<boolean>;
  saveBet(bet: Bet): Promise<boolean>;
}
