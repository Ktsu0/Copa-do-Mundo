import { IPacketRepository } from '../../domain/repositories/IPacketRepository';
import { GanhaFigurinha, PacketOpenResult } from '../../domain/entities/Packet';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getAllJogadores, nomeSemClube } from '@/shareds/infrastructure/sqlite/jogadoresQueries';
import { initDb } from '@/shareds/infrastructure/sqlite/db';
import { delay } from '@/shareds/infrastructure/utils/delay';

export class PacketRepository implements IPacketRepository {
  async getPacotesDisponiveis(): Promise<number> {
    const usuario = await UsuarioRepository.getUsuario();
    return usuario?.qtd_pacotes ?? 0;
  }

  // Abre N pacotinhos de uma vez, mas devolve os resultados separados por
  // pacote (3 figurinhas cada) para a tela revelar um pacote por vez. So
  // uma escrita no Firestore no final, com o total acumulado.
  async openPackets(quantidade: number): Promise<PacketOpenResult[]> {
    await initDb();

    const jogadores = getAllJogadores();
    if (jogadores.length === 0) {
      throw new Error('Nenhuma figurinha cadastrada no sistema.');
    }

    await delay(500);

    // Checagem de saldo, sorteio e escrita ficam dentro da mesma transacao
    // do Firestore: se dois toques concorrentes (ou dois devices) chegarem
    // aqui ao mesmo tempo, o segundo re-executa `mutate` com o saldo ja
    // atualizado pelo primeiro, em vez de sobrescreve-lo.
    return UsuarioRepository.transacao((usuario) => {
      const pacotesDisponiveis = usuario.qtd_pacotes ?? 0;
      if (quantidade <= 0 || quantidade > pacotesDisponiveis) {
        throw new Error('Quantidade de pacotinhos inválida.');
      }

      const albumJogador = new Set<string>(usuario.album_jogador ?? []);
      const total = jogadores.length;
      const resultados: PacketOpenResult[] = [];

      for (let p = 0; p < quantidade; p++) {
        const figurinhasGanhas: GanhaFigurinha[] = [];

        for (let i = 0; i < 3; i++) {
          const drawn = jogadores[Math.floor(Math.random() * jogadores.length)];
          const isNew = !albumJogador.has(drawn.id);
          if (isNew) albumJogador.add(drawn.id);

          figurinhasGanhas.push({
            id: drawn.id,
            jogadorNome: nomeSemClube(drawn.nome),
            timeId: drawn.time_id,
            posicao: drawn.posicao,
            isNew,
            fotoUrl: drawn.imagem_url,
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

      return {
        result: resultados,
        updates: {
          qtd_pacotes: pacotesDisponiveis - quantidade,
          qtd_pacote_aberto: (usuario.qtd_pacote_aberto ?? 0) + quantidade,
          album_jogador: Array.from(albumJogador),
        },
      };
    });
  }
}
