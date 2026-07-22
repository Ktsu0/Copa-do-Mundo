import { AlbumOverview } from '../../domain/entities/Album';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import faseGrupoData from '../../../../infra/fase_grupo.json';
import timesDetalhesData from '../../../../infra/times_detalhes.json';
import figurinhasData from '../../../../infra/figurinhas.json';

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

        // Group teams by their group
        const groupsMap = new Map<string, any[]>();
        faseGrupoData.forEach((teamFase) => {
          if (!groupsMap.has(teamFase.grupo)) {
            groupsMap.set(teamFase.grupo, []);
          }
          
          const details = timesDetalhesData.find(t => t.id === teamFase.timeId);

          groupsMap.get(teamFase.grupo)!.push({
            id: teamFase.timeId,
            name: teamFase.nome,
            flagUrl: details?.escudoUrl || getFlagUrl(teamFase.timeId, 40),
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
