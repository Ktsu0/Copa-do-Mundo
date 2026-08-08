import { IBettingRepository } from '../../domain/repositories/IBettingRepository';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { initDb } from '@/shareds/infrastructure/sqlite/db';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { delay } from '@/shareds/infrastructure/utils/delay';
import { mapJogoToMatch } from '../mappers/mapJogoToMatch';

export class BettingRepository implements IBettingRepository {
  async getMatches(filtro: MatchFilter): Promise<Match[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const palpiteIds = new Set((usuario?.palpites ?? []).map((p) => p.id_palpite));

    await delay(300);
    await initDb();
    const jogos = getAllJogos();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filtered = jogos.filter((j) => {
      if (j.status === 'aguardando_definicao') return false;
      if (!j.time_casa_id || !j.time_fora_id) return false;

      if (filtro === 'hoje') {
        if (!j.data) return false;
        const jDate = new Date(j.data);
        return jDate >= today && jDate < tomorrow;
      }
      return j.fase === filtro;
    });

    // If "hoje" has no matches, fallback to showing the 6 closest upcoming
    // matches -- ordenado por data ascendente (sem data vai pro fim) em vez
    // da ordem bruta do SQLite, senao os "proximos jogos" mostrados podiam
    // ser qualquer partida agendada, nao as mais proximas.
    const source = (filtro === 'hoje' && filtered.length === 0)
      ? jogos
          .filter((j) => (j.status === 'agendado' || j.status === 'ao_vivo') && j.time_casa_id && j.time_fora_id)
          .sort((a, b) => {
            const aTime = a.data ? new Date(a.data).getTime() : Infinity;
            const bTime = b.data ? new Date(b.data).getTime() : Infinity;
            return aTime - bTime;
          })
          .slice(0, 6)
      : filtered;

    const matches: Match[] = source.map((j) => mapJogoToMatch(j, palpiteIds));

    return matches;
  }
}
