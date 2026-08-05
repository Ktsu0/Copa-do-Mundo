import { TeamAlbum } from '../../domain/entities/Sticker';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { getJogadoresByTime, getJogadoresTotal, nomeSemClube } from '@/shareds/infrastructure/sqlite/jogadoresQueries';
import { delay } from '@/shareds/infrastructure/utils/delay';

interface TimeRow {
  id: string;
  nome: string;
}

export class StickerRepository {
  async getTeamAlbum(teamId?: string): Promise<TeamAlbum> {
    const selectedId = teamId || 'BRA';
    await initDb();
    const usuario = await UsuarioRepository.getUsuario();
    const albumJogador = new Set(usuario?.album_jogador ?? []);

    const total = getJogadoresTotal();
    const globalProgress = {
      collected: albumJogador.size,
      total,
      percentage: total > 0 ? parseFloat(((albumJogador.size / total) * 100).toFixed(1)) : 0,
    };

    await delay(300);

    // Teams for the header
    const times = getDbSync().getAllSync<TimeRow>('SELECT id, nome FROM times');
    const teams = times.map(t => ({ id: t.id, name: t.nome }));

    // Stickers for the selected team
    const teamStickers = getJogadoresByTime(selectedId).map((j) => {
      const isCollected = albumJogador.has(j.id);
      return {
        id: j.id,
        code: j.codigo,
        position: j.posicao,
        number: j.codigo.split(' ').pop() ?? '',
        playerName: nomeSemClube(j.nome),
        isCollected,
        imageUrl: j.imagem_url,
      };
    });

    return {
      globalProgress,
      teams,
      selectedTeamId: selectedId,
      stickers: teamStickers,
    };
  }
}
