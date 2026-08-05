import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule, ScheduleGame, Standing } from '../../domain/entities/GroupSchedule';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
import { delay } from '@/shareds/infrastructure/utils/delay';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { Match } from '@/features/betting-page/domain/entities/Match';

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
    // apostas (ver GroupSchedule.ts), entao usam o formato `Match`
    // (fase/timeCasaFlagUrl/temPalpite etc.) em vez de um shape proprio.
    const matches: ScheduleGame[] = groupMatches.map((j): Match => ({
      id: j.id,
      fase: j.fase as Match['fase'],
      data: j.data,
      status: j.status as Match['status'],
      timeCasaId: j.time_casa_id,
      timeForaId: j.time_fora_id,
      timeCasaNome: getTeamName(j.time_casa_id),
      timeForaNome: getTeamName(j.time_fora_id),
      timeCasaFlagUrl: getFlagUrl(j.time_casa_id),
      timeForaFlagUrl: getFlagUrl(j.time_fora_id),
      placarCasa: j.placar_casa,
      placarFora: j.placar_fora,
      temPalpite: palpiteIds.has(j.id),
    }));

    return {
      grupo,
      standings,
      matches,
    };
  }
}
