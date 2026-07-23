import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule, Standing } from '../../domain/entities/GroupSchedule';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

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
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const groupTeams = db.getAllSync<FaseGrupoRow>('SELECT * FROM fase_grupo WHERE grupo = ?', [grupo]);
        if (groupTeams.length === 0) {
          resolve(null);
          return;
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

        const matches: any[] = groupMatches.map((j) => ({
          id: j.id,
          data: j.data,
          timeCasaId: j.time_casa_id,
          timeCasaNome: getTeamName(j.time_casa_id),
          timeCasaFlagUrl: getFlagUrl(j.time_casa_id),
          timeForaId: j.time_fora_id,
          timeForaNome: getTeamName(j.time_fora_id),
          timeForaFlagUrl: getFlagUrl(j.time_fora_id),
          placarCasa: j.placar_casa,
          placarFora: j.placar_fora,
          status: j.status,
          fase: j.fase || 'dezesseis_avos',
          temPalpite: false
        }));

        resolve({
          grupo,
          standings,
          matches,
        });
      }, 300);
    });
  }
}
