import { TeamAlbum } from '../../domain/entities/Sticker';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { FIGURINHA_FOTOS } from '@/shareds/infrastructure/assets/figurinhaFotos';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';

interface TimeRow {
  id: string;
  nome: string;
}

function figurinhaNumero(figId: string): number {
  return parseInt(figId.split('-')[1], 10);
}

export class StickerRepository {
  async getTeamAlbum(teamId?: string): Promise<TeamAlbum> {
    const selectedId = teamId || 'BRA';
    const usuario = await UsuarioRepository.getUsuario();
    const figurinhasData = localDb.getFigurinhas();
    const albumJogador = new Set(usuario?.album_jogador ?? []);

    const total = figurinhasData.length;
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
        const teamStickers = figurinhasData
          .filter((f: any) => f.timeId === selectedId)
          .map((f: any) => {
            const isCollected = albumJogador.has(figurinhaNumero(f.id));
            return {
              id: f.id,
              code: `${f.timeId} ${f.id.split('-')[1]}`,
              playerName: f.jogadorNome,
              isCollected,
              type: f.raridade === 'lendaria' || f.raridade === 'epica' ? 'gold' : 'normal',
              imageUrl: isCollected ? FIGURINHA_FOTOS[f.id] : undefined,
            };
          });

        resolve({
          globalProgress,
          teams,
          selectedTeamId: selectedId,
          stickers: teamStickers as any,
        });
      }, 300);
    });
  }
}
