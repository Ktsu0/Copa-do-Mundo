import { getDbSync } from './db';

export interface JogadorRow {
  id: string;
  nome: string;
  time_id: string;
  posicao: string;
  codigo: string;
  imagem_url: string | null;
}

export function getJogadoresByTime(timeId: string): JogadorRow[] {
  return getDbSync().getAllSync<JogadorRow>('SELECT * FROM jogadores WHERE time_id = ?', [timeId]);
}

export function getAllJogadores(): JogadorRow[] {
  return getDbSync().getAllSync<JogadorRow>('SELECT * FROM jogadores');
}

export function getJogadoresTotal(): number {
  return getDbSync().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM jogadores')!.n;
}
