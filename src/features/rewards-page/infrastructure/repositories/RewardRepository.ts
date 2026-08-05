import { IRewardRepository } from '../../domain/repositories/IRewardRepository';
import { Reward } from '../../domain/entities/Reward';
import { getDbSync, initDb } from '@/shareds/infrastructure/sqlite/db';
import { UsuarioRepository, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getJogadoresTotal } from '@/shareds/infrastructure/sqlite/jogadoresQueries';

interface RecompensaRow {
  id: string;
  titulo: string;
  descricao: string;
  requisito_progresso: number;
  premio_tipo: string;
  premio_quantidade: number;
}

function recompensaNumero(id: string): number {
  return parseInt(id.split('-')[1], 10);
}

function calcularProgresso(usuario: UsuarioFirestore | null): number {
  const total = getJogadoresTotal();
  const collected = usuario?.album_jogador?.length ?? 0;
  return total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0;
}

function getRecompensas(): RecompensaRow[] {
  return getDbSync().getAllSync<RecompensaRow>('SELECT id, titulo, descricao, requisito_progresso, premio_tipo, premio_quantidade FROM recompensas');
}

export class RewardRepository implements IRewardRepository {
  async getRewards(): Promise<Reward[]> {
    await initDb();
    const usuario = await UsuarioRepository.getUsuario();
    const progress = calcularProgresso(usuario);
    const conquistas = new Set(usuario?.conquistas ?? []);
    const rewards = getRecompensas();

    return rewards.map((r) => {
      const resgatado = conquistas.has(recompensaNumero(r.id));
      return {
        id: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        requisitoProgresso: r.requisito_progresso,
        // r.premio_tipo vem do SQLite como `string` -- o dominio exige o
        // union literal 'pacotes' | 'pontos'. O JSON original nao garantia
        // isso em tempo de compilacao (era lido como `any`); aqui e explicito.
        premioTipo: r.premio_tipo as Reward['premioTipo'],
        premioQuantidade: r.premio_quantidade,
        resgatado,
        resgatavel: progress >= r.requisito_progresso && !resgatado,
      };
    });
  }

  async claimReward(id: string): Promise<boolean> {
    await initDb();
    const rewards = getRecompensas();
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return false;

    // Checagem "ja resgatado"/progresso e o credito de pontos/pacotes ficam
    // dentro da mesma transacao: dois toques rapidos em "RESGATAR" nao
    // conseguem os dois passar na checagem e creditar em duplicidade.
    try {
      return await UsuarioRepository.transacao((usuario) => {
        const numero = recompensaNumero(id);
        const conquistas = usuario.conquistas ?? [];
        if (conquistas.includes(numero)) {
          return { result: false, updates: {} };
        }

        const progress = calcularProgresso(usuario);
        if (progress < reward.requisito_progresso) {
          return { result: false, updates: {} };
        }

        const updates: Partial<UsuarioFirestore> = { conquistas: [...conquistas, numero] };
        if (reward.premio_tipo === 'pacotes') {
          updates.qtd_pacotes = (usuario.qtd_pacotes ?? 0) + reward.premio_quantidade;
        } else if (reward.premio_tipo === 'pontos') {
          updates.pontos = (usuario.pontos ?? 0) + reward.premio_quantidade;
        }

        return { result: true, updates };
      });
    } catch {
      return false;
    }
  }
}
