import { IRewardRepository } from '../../domain/repositories/IRewardRepository';
import { Reward } from '../../domain/entities/Reward';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { UsuarioRepository, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import figurinhasData from '../../../../infra/figurinhas.json';

function recompensaNumero(id: string): number {
  return parseInt(id.split('-')[1], 10);
}

function calcularProgresso(usuario: UsuarioFirestore | null): number {
  const total = figurinhasData.length;
  const collected = usuario?.album_jogador?.length ?? 0;
  return total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0;
}

export class RewardRepository implements IRewardRepository {
  async getRewards(): Promise<Reward[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const progress = calcularProgresso(usuario);
    const conquistas = new Set(usuario?.conquistas ?? []);
    const rewards = localDb.getRecompensas();

    return rewards.map((r: any) => {
      const resgatado = conquistas.has(recompensaNumero(r.id));
      return {
        ...r,
        resgatado,
        resgatavel: progress >= r.requisitoProgresso && !resgatado,
      };
    });
  }

  async claimReward(id: string): Promise<boolean> {
    const rewards = localDb.getRecompensas();
    const reward = rewards.find((r: any) => r.id === id);
    if (!reward) return false;

    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) return false;

    const numero = recompensaNumero(id);
    const conquistas = usuario.conquistas ?? [];
    if (conquistas.includes(numero)) return false;

    const progress = calcularProgresso(usuario);
    if (progress < reward.requisitoProgresso) return false;

    const updates: Partial<UsuarioFirestore> = { conquistas: [...conquistas, numero] };

    if (reward.premioTipo === 'pacotes') {
      updates.qtd_pacotes = (usuario.qtd_pacotes ?? 0) + reward.premioQuantidade;
    } else if (reward.premioTipo === 'pontos') {
      updates.pontos = (usuario.pontos ?? 0) + reward.premioQuantidade;
    }

    await UsuarioRepository.updateUsuario(updates);
    return true;
  }
}
