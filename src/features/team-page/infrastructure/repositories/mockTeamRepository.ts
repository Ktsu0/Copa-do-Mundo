import { TimeResumo } from '../../domain/entities/TimeResumo';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';

interface TimeRow {
  id: string;
  nome: string;
  escudo_url: string | null;
  titulos_copa_do_mundo: number;
}

interface FaseGrupoRow {
  time_id: string;
  grupo: string;
}

class TeamRepository implements ITeamRepository {
  async getTeams(): Promise<TimeResumo[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const times = db.getAllSync<TimeRow>('SELECT id, nome, escudo_url, titulos_copa_do_mundo FROM times');
        const faseGrupo = db.getAllSync<FaseGrupoRow>('SELECT time_id, grupo FROM fase_grupo');
        const grupoPorTime = new Map(faseGrupo.map((f) => [f.time_id, f.grupo]));

        const teams = times.map((t) => {
          let subtitulo = `${t.titulos_copa_do_mundo} TÍTULO${t.titulos_copa_do_mundo !== 1 ? 'S' : ''}`;
          if (t.id === 'ARG') {
            subtitulo = 'ATUAL CAMPEÃO';
          }

          const grupo = grupoPorTime.get(t.id);

          return {
            id: t.id.toLowerCase(),
            nome: t.nome,
            grupo: grupo ? `Grupo ${grupo}` : 'Grupo ?',
            subtitulo,
            bandeiraUrl: t.escudo_url || getFlagUrl(t.id, 640),
            isFavorito: t.id === 'BRA',
          };
        });

        resolve(teams);
      }, 500);
    });
  }
}

export const mockTeamRepository = new TeamRepository();
