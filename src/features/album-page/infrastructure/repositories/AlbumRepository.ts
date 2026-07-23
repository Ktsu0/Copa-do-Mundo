import { AlbumOverview } from '../../domain/entities/Album';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import figurinhasData from '../../../../infra/figurinhas.json';

interface FaseGrupoRow {
  time_id: string;
  nome: string;
  grupo: string;
}

interface TimeRow {
  id: string;
  escudo_url: string | null;
}

export class AlbumRepository {
  async getAlbumOverview(): Promise<AlbumOverview> {
    const usuario = await UsuarioRepository.getUsuario();
    const albumJogador = usuario?.album_jogador ?? [];
    const total = figurinhasData.length;
    const progress = {
      collected: albumJogador.length,
      total,
      percentage: total > 0 ? parseFloat(((albumJogador.length / total) * 100).toFixed(1)) : 0,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const faseGrupos = db.getAllSync<FaseGrupoRow>('SELECT time_id, nome, grupo FROM fase_grupo');
        const times = db.getAllSync<TimeRow>('SELECT id, escudo_url FROM times');
        const escudoPorTime = new Map(times.map((t) => [t.id, t.escudo_url]));

        // Group teams by their group
        const groupsMap = new Map<string, any[]>();
        faseGrupos.forEach((teamFase) => {
          if (!groupsMap.has(teamFase.grupo)) {
            groupsMap.set(teamFase.grupo, []);
          }

          groupsMap.get(teamFase.grupo)!.push({
            id: teamFase.time_id,
            name: teamFase.nome,
            flagUrl: escudoPorTime.get(teamFase.time_id) || getFlagUrl(teamFase.time_id, 40),
          });
        });

        const groups = Array.from(groupsMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([groupId, teams]) => ({
            id: groupId,
            name: `Grupo ${groupId}`,
            teams: teams,
          }));

        resolve({
          progress,
          groups,
        });
      }, 500);
    });
  }
}
