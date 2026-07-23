import { getDbSync } from './db';

export interface JogoRow {
  id: string;
  fase: string;
  data: string | null;
  status: string;
  time_casa_id: string | null;
  time_fora_id: string | null;
  placar_casa: number | null;
  placar_fora: number | null;
  penaltis_casa: number | null;
  penaltis_fora: number | null;
  time_casa_origem_jogo_id: string | null;
  time_fora_origem_jogo_id: string | null;
}

export function getAllJogos(): JogoRow[] {
  return getDbSync().getAllSync<JogoRow>('SELECT * FROM jogos');
}

export function getJogoById(id: string): JogoRow | null {
  return getDbSync().getFirstSync<JogoRow>('SELECT * FROM jogos WHERE id = ?', [id]);
}
