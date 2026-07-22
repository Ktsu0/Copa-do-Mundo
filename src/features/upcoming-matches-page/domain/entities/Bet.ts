export type BetChoice = 'casa' | 'empate' | 'fora';

export interface Bet {
  jogoId: string;
  placarCasa: number;
  placarFora: number;
  primeiroMarcar: BetChoice | null;
  vencedor: BetChoice | null;
  savedAt?: string;
}

export interface MatchDetail {
  id: string;
  fase: string;
  data: string | null;
  status: string;
  timeCasaId: string;
  timeForaId: string;
  timeCasaNome: string;
  timeForaNome: string;
  timeCasaFlagUrl: string;
  timeForaFlagUrl: string;
  placarCasa: number | null;
  placarFora: number | null;
}

export const BET_REWARDS = {
  placarExato: 500,
  vencedor: 200,
  primeiroMarcar: 150,
};
