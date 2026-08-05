export type BetChoice = 'casa' | 'empate' | 'fora';

// Limite superior de placar aceito num palpite -- sem isso, o contador de
// score na UI so tinha piso (Math.max(0, ...)) e nao teto, permitindo
// valores sem sentido como 9999x0.
export const PLACAR_MAXIMO = 20;

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
