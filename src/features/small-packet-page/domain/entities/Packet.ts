export interface PacketOpenResult {
  figurinhasGanhas: GanhaFigurinha[];
  novosProgressos: {
    collected: number;
    total: number;
    percentage: number;
  };
}

export interface GanhaFigurinha {
  id: string;
  jogadorNome: string;
  timeId: string;
  posicao: string;
  isNew: boolean;
  fotoUrl: string | null;
}

export const QUANTIDADES_ABERTURA = [1, 5, 10] as const;
