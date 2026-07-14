export interface BettingStats {
  total: number;
  acertos: number;
  erros: number;
  pendentes: number;
}

export interface Profile {
  nome: string;
  email: string;
  avatarUrl: string;
  pontos: number;
  figurinhasColetadas: number;
  figurinhasTotal: number;
  percentualFigurinhas: number;
  estatisticasApostas: BettingStats;
}

// Avatares pre-definidos para o usuario escolher (sem upload de foto real
// por enquanto -- ver AvatarPickerModal).
export const AVATARES_DISPONIVEIS: string[] = [
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=13',
  'https://i.pravatar.cc/150?img=14',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=16',
  'https://i.pravatar.cc/150?img=17',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=19',
  'https://i.pravatar.cc/150?img=20',
  'https://i.pravatar.cc/150?img=21',
  'https://i.pravatar.cc/150?img=22',
];
