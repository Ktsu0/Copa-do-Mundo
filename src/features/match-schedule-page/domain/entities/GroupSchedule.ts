import { Match } from '@/features/betting-page/domain/entities/Match';

export interface Standing {
  posicao: number;
  timeId: string;
  nome: string;
  bandeira: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number | null;
  golsContra: number | null;
  saldoGols: number | null;
}

// Os jogos do calendario de grupo sao renderizados com o mesmo MatchCard
// (@/features/betting-page/presentation/components/MatchCard) usado na aba
// de apostas, entao usam o mesmo formato `Match` em vez de um shape proprio.
export type ScheduleGame = Match;

export interface GroupSchedule {
  grupo: string;
  standings: Standing[];
  matches: ScheduleGame[];
}
