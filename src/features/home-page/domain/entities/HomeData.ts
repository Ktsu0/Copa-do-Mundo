export interface DailyReward {
  available: boolean;
  countdownSeconds: number;
  packetType: string;
  cardsCount: number;
}

export interface FeaturedMatch {
  id: string;
  timeCasaNome: string;
  timeForaNome: string;
  timeCasaId: string;
  timeForaId: string;
  flagCasa: string;
  flagFora: string;
  placarCasa: number | null;
  placarFora: number | null;
  status: string;
  minuto?: number | null;
}

export interface HomeData {
  userName: string;
  userPoints: number;
  pacotinhosDisponiveis: number;
  dailyReward: DailyReward;
  featuredMatch: FeaturedMatch | null;
}
