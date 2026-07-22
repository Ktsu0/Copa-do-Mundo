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
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export interface ScheduleGame {
  id: string;
  data: string | null;
  timeCasaId: string;
  timeCasaNome: string;
  timeCasaBandeira: string;
  timeForaId: string;
  timeForaNome: string;
  timeForaBandeira: string;
  placarCasa: number | null;
  placarFora: number | null;
  status: string;
}

export interface GroupSchedule {
  grupo: string;
  standings: Standing[];
  matches: ScheduleGame[];
}
