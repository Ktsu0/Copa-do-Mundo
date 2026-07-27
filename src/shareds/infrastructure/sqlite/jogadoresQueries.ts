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

export function getJogadoresPorIds(ids: string[]): JogadorRow[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDbSync().getAllSync<JogadorRow>(`SELECT * FROM jogadores WHERE id IN (${placeholders})`, ids);
}

export function getJogadoresTotal(): number {
  return getDbSync().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM jogadores')!.n;
}

// jogadores.nome vem como "Nome do Jogador (Clube - Pais)" (ver
// scripts/build-sqlite-db.mjs) -- util pra exibir so o nome em telas onde o
// clube/pais ja aparece separado (bandeira, escudo) ou nao cabe.
export function nomeSemClube(nome: string): string {
  return nome.replace(/\s*\([^)]*\)\s*$/, '').trim();
}
