import { IPacketRepository } from '../../domain/repositories/IPacketRepository';
import { GanhaFigurinha, PacketOpenResult } from '../../domain/entities/Packet';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { FIGURINHA_FOTOS } from '@/shareds/infrastructure/assets/figurinhaFotos';

function figurinhaNumero(figId: string): number {
  return parseInt(figId.split('-')[1], 10);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PacketRepository implements IPacketRepository {
  async getPacotesDisponiveis(): Promise<number> {
    const usuario = await UsuarioRepository.getUsuario();
    return usuario?.qtd_pacotes ?? 0;
  }

  // Abre N pacotinhos de uma vez, mas devolve os resultados separados por
  // pacote (3 figurinhas cada) para a tela revelar um pacote por vez. So
  // uma escrita no Firestore no final, com o total acumulado.
  async openPackets(quantidade: number): Promise<PacketOpenResult[]> {
    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    const pacotesDisponiveis = usuario.qtd_pacotes ?? 0;
    if (quantidade <= 0 || quantidade > pacotesDisponiveis) {
      throw new Error('Quantidade de pacotinhos inválida.');
    }

    const figurinhas = localDb.getFigurinhas();
    if (figurinhas.length === 0) {
      throw new Error('Nenhuma figurinha cadastrada no sistema.');
    }

    await delay(500);

    const albumJogador = new Set<number>(usuario.album_jogador ?? []);
    const total = figurinhas.length;
    const resultados: PacketOpenResult[] = [];

    for (let p = 0; p < quantidade; p++) {
      const figurinhasGanhas: GanhaFigurinha[] = [];

      for (let i = 0; i < 3; i++) {
        const drawn = figurinhas[Math.floor(Math.random() * figurinhas.length)];
        const numero = figurinhaNumero(drawn.id);
        const isNew = !albumJogador.has(numero);
        if (isNew) albumJogador.add(numero);

        figurinhasGanhas.push({
          id: drawn.id,
          jogadorNome: drawn.jogadorNome,
          timeId: drawn.timeId,
          posicao: drawn.posicao,
          overall: drawn.overall,
          raridade: drawn.raridade as GanhaFigurinha['raridade'],
          isNew,
          fotoUrl: FIGURINHA_FOTOS[drawn.id],
        });
      }

      const collected = albumJogador.size;
      resultados.push({
        figurinhasGanhas,
        novosProgressos: {
          collected,
          total,
          percentage: total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0,
        },
      });
    }

    await UsuarioRepository.updateUsuario({
      qtd_pacotes: pacotesDisponiveis - quantidade,
      qtd_pacote_aberto: (usuario.qtd_pacote_aberto ?? 0) + quantidade,
      album_jogador: Array.from(albumJogador),
    });

    return resultados;
  }
}
