import { TimeResumo } from '../../domain/entities/TimeResumo';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { delay } from '@/shareds/infrastructure/utils/delay';
import { formatarTitulos } from '@/shareds/infrastructure/utils/formatarTitulos';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';

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
    await delay(500);
    await initDb();
    const db = getDbSync();
    const times = db.getAllSync<TimeRow>('SELECT id, nome, escudo_url, titulos_copa_do_mundo FROM times');
    const faseGrupo = db.getAllSync<FaseGrupoRow>('SELECT time_id, grupo FROM fase_grupo');
    const grupoPorTime = new Map(faseGrupo.map((f) => [f.time_id, f.grupo]));

    const usuario = await UsuarioRepository.getUsuario();
    const favoritos = new Set(usuario?.times_favoritos ?? []);

    return times.map((t) => {
      let subtitulo = formatarTitulos(t.titulos_copa_do_mundo);
      // TODO: hardcode do id 'ARG' como atual campeao -- revisar apos a
      // proxima Copa. Idealmente isso viraria um campo no dado do time, mas
      // este repositorio mock usa a tabela SQLite `times` como fonte, entao
      // adicionar um campo novo exigiria mexer no schema/dado estático.
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
        isFavorito: favoritos.has(t.id.toLowerCase()),
      };
    });
  }
}

export const mockTeamRepository = new TeamRepository();
