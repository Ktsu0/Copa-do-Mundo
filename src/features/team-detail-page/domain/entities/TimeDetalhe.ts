export interface Jogador {
  id: string;
  nome: string;
  posicao: string;
  numero: string;
  fotoUrl: string;
}

export interface TimeDetalhe {
  id: string;
  nome: string;
  bandeiraUrl: string;
  titulosInfo: string;
  federacao: string;
  isFavorito: boolean;
  estatisticas: {
    jogadores: number;
    rankingFifa: string;
    grupo: string;
  };
  elenco: Jogador[];
}
