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
  overall: number;
  raridade: 'comum' | 'rara' | 'epica' | 'lendaria';
  isNew: boolean;
  // Asset local (require), nao URL -- ver FIGURINHA_FOTOS.
  fotoUrl?: number;
}

export const QUANTIDADES_ABERTURA = [1, 5, 10] as const;
