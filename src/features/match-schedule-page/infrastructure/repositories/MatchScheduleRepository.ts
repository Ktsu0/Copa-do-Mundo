import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule, ScheduleGame, Standing } from '../../domain/entities/GroupSchedule';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
import { delay } from '@/shareds/infrastructure/utils/delay';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { mapJogoToMatch } from '@/features/betting-page/infrastructure/mappers/mapJogoToMatch';

interface FaseGrupoRow {
  time_id: string;
  nome: string;
  grupo: string;
  posicao_final: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
  gols_pro: number | null;
  gols_contra: number | null;
  saldo_gols: number | null;
}

export class MatchScheduleRepository implements IMatchScheduleRepository {
  async getGroupSchedule(grupo: string): Promise<GroupSchedule | null> {
    await delay(300);
    await initDb();
    const db = getDbSync();
    const groupTeams = db.getAllSync<FaseGrupoRow>('SELECT * FROM fase_grupo WHERE grupo = ?', [grupo]);
    if (groupTeams.length === 0) {
      return null;
    }

    const standings: Standing[] = groupTeams.map((t) => ({
      posicao: t.posicao_final,
      timeId: t.time_id,
      nome: t.nome ?? getTeamName(t.time_id),
      bandeira: getFlagUrl(t.time_id),
      pontos: t.pontos,
      jogos: t.jogos,
      vitorias: t.vitorias,
      empates: t.empates,
      derrotas: t.derrotas,
      golsPro: t.gols_pro,
      golsContra: t.gols_contra,
      saldoGols: t.saldo_gols,
    })).sort((a: Standing, b: Standing) => a.posicao - b.posicao);

    const groupTeamIds = new Set(standings.map(s => s.timeId));

    const jogos = getAllJogos();
    const groupMatches = jogos.filter((j) =>
      j.fase === 'dezesseis_avos' &&
      j.time_casa_id && j.time_fora_id &&
      groupTeamIds.has(j.time_casa_id) &&
      groupTeamIds.has(j.time_fora_id)
    );

    const usuario = await UsuarioRepository.getUsuario();
    const palpiteIds = new Set((usuario?.palpites ?? []).map((p) => p.id_palpite));

    // Os jogos daqui sao renderizados com o mesmo MatchCard da aba de
    // apostas (ver GroupSchedule.ts), entao usam o mesmo mapeamento
    // JogoRow -> `Match` que o BettingRepository (fase/timeCasaFlagUrl/
    // temPalpite etc.) em vez de um shape proprio.
    const matches: ScheduleGame[] = groupMatches.map((j) => mapJogoToMatch(j, palpiteIds));

    return {
      grupo,
      standings,
      matches,
    };
  }
}
