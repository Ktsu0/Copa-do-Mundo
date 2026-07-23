import { TeamAlbum } from '../../domain/entities/Sticker';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { getJogadoresByTime, getJogadoresTotal } from '@/shareds/infrastructure/sqlite/jogadoresQueries';

interface TimeRow {
  id: string;
  nome: string;
}

export class StickerRepository {
  async getTeamAlbum(teamId?: string): Promise<TeamAlbum> {
    const selectedId = teamId || 'BRA';
    const usuario = await UsuarioRepository.getUsuario();
    const albumJogador = new Set(usuario?.album_jogador ?? []);

    const total = getJogadoresTotal();
    const globalProgress = {
      collected: albumJogador.size,
      total,
      percentage: total > 0 ? parseFloat(((albumJogador.size / total) * 100).toFixed(1)) : 0,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        // Teams for the header
        const times = getDbSync().getAllSync<TimeRow>('SELECT id, nome FROM times');
        const teams = times.map(t => ({ id: t.id, name: t.nome }));

        // Stickers for the selected team
        const teamStickers = getJogadoresByTime(selectedId).map((j) => {
          const isCollected = albumJogador.has(j.id);
          return {
            id: j.id,
            code: j.codigo,
            playerName: j.nome,
            isCollected,
            imageUrl: j.imagem_url,
          };
        });

        resolve({
          globalProgress,
          teams,
          selectedTeamId: selectedId,
          stickers: teamStickers,
        });
      }, 300);
    });
  }
}
