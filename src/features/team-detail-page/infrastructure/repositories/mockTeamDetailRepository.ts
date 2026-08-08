import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { ITeamDetailRepository } from '../../domain/repositories/ITeamDetailRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { getJogadoresByTime, nomeSemClube } from '@/shareds/infrastructure/sqlite/jogadoresQueries';
import { delay } from '@/shareds/infrastructure/utils/delay';
import { formatarTitulos } from '@/shareds/infrastructure/utils/formatarTitulos';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';

interface TimeRow {
  id: string;
  nome: string;
  confederacao: string;
  escudo_url: string | null;
  titulos_copa_do_mundo: number;
  jogadores_convocados: number;
}

interface FaseGrupoRow {
  grupo: string;
}

class TeamDetailRepository implements ITeamDetailRepository {
  async getTeamDetail(id: string): Promise<TimeDetalhe | null> {
    await delay(500);
    await initDb();
    const upperId = id.toUpperCase();
    const db = getDbSync();
    const teamData = db.getFirstSync<TimeRow>(
      'SELECT id, nome, confederacao, escudo_url, titulos_copa_do_mundo, jogadores_convocados FROM times WHERE id = ?',
      [upperId]
    );

    if (!teamData) {
      return null;
    }

    const fase = db.getFirstSync<FaseGrupoRow>('SELECT grupo FROM fase_grupo WHERE time_id = ?', [upperId]);

    const bandeiraUrl = teamData.escudo_url || getFlagUrl(upperId, 640);

    const usuario = await UsuarioRepository.getUsuario();
    const isFavorito = (usuario?.times_favoritos ?? []).includes(id.toLowerCase());

    const titulosInfo = formatarTitulos(teamData.titulos_copa_do_mundo);

    const posicaoLabel: Record<string, string> = {
      GOL: 'Goleiro',
      DEF: 'Defensor',
      MEI: 'Meio-Campo',
      ATA: 'Atacante',
    };

    const elenco = getJogadoresByTime(upperId).map((j, index) => ({
      id: j.id,
      nome: nomeSemClube(j.nome),
      posicao: posicaoLabel[j.posicao] ?? j.posicao,
      numero: String(index + 1).padStart(2, '0'),
      fotoUrl: j.imagem_url ?? `https://i.pravatar.cc/150?u=${j.id}`,
    }));

    return {
      id: id.toLowerCase(),
      nome: teamData.nome,
      bandeiraUrl,
      titulosInfo,
      federacao: teamData.confederacao,
      isFavorito,
      estatisticas: {
        jogadores: teamData.jogadores_convocados,
        rankingFifa: 'N/A', // Mocking FIFA ranking as N/A since it's not in the JSON
        grupo: fase ? `Grupo ${fase.grupo}` : 'N/A',
      },
      elenco,
    };
  }
}

export const mockTeamDetailRepository = new TeamDetailRepository();
