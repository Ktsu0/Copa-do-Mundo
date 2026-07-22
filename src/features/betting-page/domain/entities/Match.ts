export type MatchStatus = 'agendado' | 'ao_vivo' | 'finalizado' | 'aguardando_definicao';
export type MatchFase = 'dezesseis_avos' | 'oitavas' | 'quartas' | 'semifinal' | 'final';
export type MatchFilter = 'hoje' | 'dezesseis_avos' | 'oitavas';

export interface Match {
  id: string;
  fase: MatchFase;
  data: string | null;
  status: MatchStatus;
  timeCasaId: string | null;
  timeForaId: string | null;
  timeCasaNome: string;
  timeForaNome: string;
  timeCasaFlagUrl: string;
  timeForaFlagUrl: string;
  placarCasa: number | null;
  placarFora: number | null;
  temPalpite: boolean;
}
