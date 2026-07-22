import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule, Standing, ScheduleGame } from '../../domain/entities/GroupSchedule';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class MatchScheduleRepository implements IMatchScheduleRepository {
  async getGroupSchedule(grupo: string): Promise<GroupSchedule | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const faseGrupos = localDb.getFaseGrupo() as any[];
        const jogos = localDb.getJogos() as any[];

        const groupTeams = faseGrupos.filter((t: any) => t.grupo === grupo);
        if (groupTeams.length === 0) {
          resolve(null);
          return;
        }

        const standings: Standing[] = groupTeams.map((t: any) => ({
          posicao: t.posicaoFinal,
          timeId: t.timeId,
          nome: t.nome ?? getTeamName(t.timeId),
          bandeira: getFlagUrl(t.timeId),
          pontos: t.pontos,
          jogos: t.jogos,
          vitorias: t.vitorias,
          empates: t.empates,
          derrotas: t.derrotas,
          golsPro: t.golsPro,
          golsContra: t.golsContra,
          saldoGols: t.saldoGols,
        })).sort((a: Standing, b: Standing) => a.posicao - b.posicao);

        const groupTeamIds = new Set(standings.map(s => s.timeId));

        const groupMatches = jogos.filter((j: any) => 
          j.fase === 'dezesseis_avos' && 
          j.timeCasaId && j.timeForaId &&
          groupTeamIds.has(j.timeCasaId) && 
          groupTeamIds.has(j.timeForaId)
        );

        const matches: any[] = groupMatches.map((j: any) => ({
          id: j.id,
          data: j.data,
          timeCasaId: j.timeCasaId,
          timeCasaNome: getTeamName(j.timeCasaId),
          timeCasaFlagUrl: getFlagUrl(j.timeCasaId),
          timeForaId: j.timeForaId,
          timeForaNome: getTeamName(j.timeForaId),
          timeForaFlagUrl: getFlagUrl(j.timeForaId),
          placarCasa: j.placarCasa,
          placarFora: j.placarFora,
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
