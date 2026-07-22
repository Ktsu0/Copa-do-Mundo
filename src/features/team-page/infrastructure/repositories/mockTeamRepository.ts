import { TimeResumo } from '../../domain/entities/TimeResumo';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import timesDetalhesData from '../../../../infra/times_detalhes.json';
import faseGrupoData from '../../../../infra/fase_grupo.json';

class TeamRepository implements ITeamRepository {
  async getTeams(): Promise<TimeResumo[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const teams = timesDetalhesData.map(t => {
          const fase = faseGrupoData.find(f => f.timeId === t.id);
          
          let subtitulo = `${t.titulosCopaDoMundo} TÍTULO${t.titulosCopaDoMundo !== 1 ? 'S' : ''}`;
          if (t.id === 'ARG') {
            subtitulo = 'ATUAL CAMPEÃO';
          }
          
          return {
            id: t.id.toLowerCase(),
            nome: t.nome,
            grupo: fase ? `Grupo ${fase.grupo}` : 'Grupo ?',
            subtitulo: subtitulo,
            bandeiraUrl: t.escudoUrl || getFlagUrl(t.id, 640),
            isFavorito: t.id === 'BRA',
          };
        });

        resolve(teams);
      }, 500);
    });
  }
}

export const mockTeamRepository = new TeamRepository();
